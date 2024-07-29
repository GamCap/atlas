module "ecs_cluster" {
  source  = "terraform-aws-modules/ecs/aws//modules/cluster"
  version = "5.11.1"

  cluster_name = local.name

  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 50
        base   = 20
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
  }
}

module "ecs_service" {
  source  = "terraform-aws-modules/ecs/aws//modules/service"
  version = "5.11.1"

  name = "indexer"

  cluster_arn = module.ecs_cluster.arn

  desired_count = 1 // Ensure only one instance of the service runs

  deployment_controller = {
    type = "ECS"
  }

  cpu    = 1024
  memory = 4096

  task_exec_iam_statements = [
    {
      effect    = "Allow"
      actions   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
      resources = [var.postgres_secret_id, var.ponder_secrets_id]
      sid       = "AllowGetSecretValue"
    },
    {
      effect = "Allow"
      actions = [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:CreateLogGroup"
      ]
      resources = ["arn:aws:logs:${var.region}:*:log-group:${local.name}-indexer:*"]
      sid       = "AllowCreateLogGroupAndStreams"
    }
  ]

  container_definitions = {
    indexer = {
      cpu       = 1024
      memory    = 4096
      essential = true
      image     = aws_ecr_repository.ecr.repository_url
      healthCheck = {
        retries     = 3
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
        interval    = 30
        timeout     = 5
        startPeriod = 120
      }
      enable_cloudwatch_logging              = true
      create_cloudwatch_log_group            = true
      cloudwatch_log_group_name              = "/aws/ecs/${local.name}/indexer"
      cloudwatch_log_group_retention_in_days = 7

      readonly_root_filesystem = false

      log_configuration = {
        logDriver = "awslogs"
      }
      network_mode = "awsvpc"
      environment = [
        {
          name  = "NODE_OPTIONS"
          value = "--max-old-space-size=4096"
        },
        {
          name  = "MODE"
          value = "indexer"
        }
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${var.postgres_secret_id}:uri::"
        },
        {
          name      = "PONDER_RPC_URLS_1"
          valueFrom = "${var.ponder_secrets_id}:PONDER_RPC_URLS_1::"
        },
        {
          name      = "PONDER_RPC_URLS_10"
          valueFrom = "${var.ponder_secrets_id}:PONDER_RPC_URLS_10::"
        },
        {
          name      = "GCP_BUCKET_NAME"
          valueFrom = "${var.ponder_secrets_id}:GCP_BUCKET_NAME::"
        },
        {
          name      = "GCP_DIRECTORY"
          valueFrom = "${var.ponder_secrets_id}:GCP_DIRECTORY::"
        },
        {
          name      = "GCP_PROJECT"
          valueFrom = "${var.ponder_secrets_id}:GCP_PROJECT::"
        },
        {
          name      = "GCP_TEMP_DATASET_ID"
          valueFrom = "${var.ponder_secrets_id}:GCP_TEMP_DATASET_ID::"
        },
        {
          name      = "GOOGLE_APPLICATION_CREDENTIALS_BASE64"
          valueFrom = "${var.ponder_secrets_id}:GOOGLE_APPLICATION_CREDENTIALS_BASE64::"
        },
      ]
    }
  }

  subnet_ids = var.private_subnet_ids

  create_security_group = false

  security_group_ids = [var.security_group_id]
}
