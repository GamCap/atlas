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

  task_exec_iam_statements = [
    {
      effect    = "Allow"
      actions   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
      resources = [var.postgres_secret_id]
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
      cpu       = 512
      memory    = 2048
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
          name  = "MODE"
          value = "indexer"
        },
        {
          name  = "PONDER_RPC_URLS_1"
          value = "https://eth-mainnet.alchemyapi.io/v2/saJ_d7L6OvoZ3t6jL7ewhv7ONWWi_J29,https://eth-mainnet.alchemyapi.io/v2/AwMJLURd9d9VYP_Q2tG7gr52tSP_wBiA,https://eth-mainnet.alchemyapi.io/v2/zjx8baDblg7pbUjvc4zuRARLT28Ft2PC,https://eth-mainnet.alchemyapi.io/v2/0EvZQA7WvDYf40cz476eEIh348_PcZJu"
        },
        {
          name  = "PONDER_RPC_URLS_10"
          value = "https://opt-mainnet.g.alchemy.com/v2/aUooVzDMm5Vp134Wi07WBlpWeJPq97yX,https://opt-mainnet.g.alchemy.com/v2/aVjgXLi_aJZvM_W_N4e1L-9SJXOEd0L5,https://opt-mainnet.g.alchemy.com/v2/AJMG7qpBNCskviWEj93HW4nioGl8neDp,https://opt-mainnet.g.alchemy.com/v2/aZAch5n6Co6vvepI37ogK-QLiCmofL04,https://opt-mainnet.g.alchemy.com/v2/bEw3og1rC9BHAidSjH24d18OEPFnEyCC"
        }
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${var.postgres_secret_id}:uri::"
        }
      ]
    }
  }

  subnet_ids = var.private_subnet_ids

  create_security_group = false

  security_group_ids = [var.security_group_id]
}
