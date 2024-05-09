locals {
    app_name = "atlas"
}

module "tags" {
  source = "./tags"

  application = local.app_name
  env         = terraform.workspace
}

module "supabase" {
  source = "./supabase"
  app_name = local.app_name
}

resource "aws_security_group" "ponder" {

  name = "ponder"
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
  from_port                    = jsondecode(data.aws_secretsmanager_secret_version.cluster_supabase_admin_secret.secret_string)["port"]
  to_port                      = jsondecode(data.aws_secretsmanager_secret_version.cluster_supabase_admin_secret.secret_string)["port"]
  referenced_security_group_id = aws_security_group.ponder.id
  ip_protocol                  = "tcp"
  security_group_id            = module.supabase.cluster_security_group
}

module "ponder" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "5.6.1"

  name = "ponder"

  instance_type = "t3.medium"

  ami = "ami-07caf09b362be10b8"

  key_name = "ponder"

  vpc_security_group_ids = [aws_security_group.ponder.id]
  subnet_id = data.aws_subnets.supabase_public.ids[0]
}