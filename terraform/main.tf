locals {
  app_name = "atlas"
}

module "tags" {
  source = "./tags"

  application = local.app_name
  env         = terraform.workspace
}

module "supabase" {
  source   = "./supabase"
  app_name = local.app_name
  supabase_email = "noreply@gamcaplabs.com"
  supabase_sender_name = "GamCap Labs"
  supabase_disable_signup = "false"
  supabase_site_url = "http://localhost:3000"
}

resource "aws_security_group" "ponder" {

  name   = "ponder"
  vpc_id = module.supabase.vpc_id

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

resource "aws_vpc_security_group_ingress_rule" "ponder" {
  description                  = "EC2 instance security group ingress rule from Supabase database migration function security group"
  from_port                    = jsondecode(data.aws_secretsmanager_secret_version.cluster_postgres_secret.secret_string)["port"]
  to_port                      = jsondecode(data.aws_secretsmanager_secret_version.cluster_postgres_secret.secret_string)["port"]
  referenced_security_group_id = aws_security_group.ponder.id
  ip_protocol                  = "tcp"
  security_group_id            = module.supabase.cluster_security_group
}

module "ponder" {
  source = "./ponder"

  app_name           = local.app_name
  vpc_id             = module.supabase.vpc_id
  security_group_id  = aws_security_group.ponder.id
  private_subnet_ids = data.aws_subnets.supabase_private.ids
  region             = var.region
  postgres_secret_id = data.aws_secretsmanager_secret.cluster_postgres_secret.id
}
