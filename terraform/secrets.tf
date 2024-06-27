// Random suffix to name the secret

resource "random_id" "ponder_secrets" {
  byte_length = 4
}

resource "aws_secretsmanager_secret" "ponder_secrets" {
  name = "${local.app_name}-ponder-secrets-${random_id.ponder_secrets.hex}"

  force_overwrite_replica_secret = true
}