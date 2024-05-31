resource "aws_secretsmanager_secret" "ponder_secrets" {
  name = "${local.app_name}-ponder-secrets"
}