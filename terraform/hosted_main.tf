
resource "aws_security_group" "ponder" {

  name   = "ponder"
  vpc_id = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.13.0"

  name = "ponder"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a"]
  private_subnets = ["10.0.1.0/24"]
  public_subnets  = ["10.0.101.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = true
}

resource "random_id" "hosted_supabase" {
  byte_length = 4
}

resource "aws_secretsmanager_secret" "hosted_supabase" {
  name = "${local.app_name}-hosted-supabase-${random_id.hosted_supabase.hex}"

  force_overwrite_replica_secret = true
}


module "ponder" {
  source             = "./ponder"
  app_name           = local.app_name
  vpc_id             = module.vpc.vpc_id
  security_group_id  = aws_security_group.ponder.id
  private_subnet_ids = module.vpc.private_subnets
  region             = var.region
  postgres_secret_id = aws_secretsmanager_secret.hosted_supabase.id
  ponder_secrets_id  = aws_secretsmanager_secret.ponder_secrets.id
}
