data "aws_vpc" "supabase" {
  id = module.supabase.vpc_id
}

data "aws_subnets" "supabase_private" {

  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.supabase.id]
  }

  filter {
    name   = "tag:aws-cdk:subnet-type"
    values = ["Private"]
  }
}

data "aws_subnets" "supabase_public" {

  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.supabase.id]
  }

  filter {
    name   = "tag:aws-cdk:subnet-type"
    values = ["Public"]
  }
}

data "aws_secretsmanager_secret" "cluster_supabase_admin_secret" {
  arn = module.supabase.cluster_supabase_admin_secret
}

data "aws_secretsmanager_secret_version" "cluster_supabase_admin_secret" {
  secret_id = data.aws_secretsmanager_secret.cluster_supabase_admin_secret.id
}