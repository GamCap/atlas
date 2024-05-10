# StudioUrl
# SupabaseUrl
# SupabaseAnonKey
# VpcId
# ClusterArn
# ClusterSecurityGroup
# ClusterSupabaseAdminSecret

output "supabase_anon_key" {
  value       = aws_cloudformation_stack.supabase.outputs["SupabaseAnonKey"]
  description = "Anonymous access key for Supabase, safe to use in a browser under secured configurations."
}

output "studio_url" {
  value       = aws_cloudformation_stack.supabase.outputs["StudioUrl"]
  description = "URL to the Supabase studio dashboard for project management."
}

output "supabase_url" {
  value       = aws_cloudformation_stack.supabase.outputs["SupabaseUrl"]
  description = "Base URL for accessing the Supabase API."
}

output "vpc_id" {
  value       = aws_cloudformation_stack.supabase.outputs["VpcId"]
  description = "VPC ID for the Supabase stack."
}

output "cluster_supabase_admin_secret" {
  value       = aws_cloudformation_stack.supabase.outputs["ClusterSupabaseAdminSecret"]
  description = "Admin secret for the Supabase cluster."
}

output "cluster_arn" {
  value       = aws_cloudformation_stack.supabase.outputs["ClusterArn"]
  description = "ARN for the Supabase cluster."
}

output "cluster_security_group" {
  value       = aws_cloudformation_stack.supabase.outputs["ClusterSecurityGroup"]
  description = "Security group for the Supabase cluster."
}

