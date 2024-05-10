output "secret_string" {
  sensitive = true
  value     = data.aws_secretsmanager_secret_version.cluster_supabase_admin_secret.secret_string
}

output "supabase_url" {
  value = module.supabase.supabase_url
}

output "studio_url" {
  value = module.supabase.studio_url
}

output "vpc_id" {
  value = module.supabase.vpc_id
}

output "cluster_arn" {
  value = module.supabase.cluster_arn
}

output "cluster_security_group" {
  value = module.supabase.cluster_security_group
}