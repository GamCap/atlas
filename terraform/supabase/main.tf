resource "aws_cloudformation_stack" "supabase" {
  name         = local.name
  template_url = "https://s3.us-east-1.amazonaws.com/${aws_s3_bucket.supabase.bucket}/${aws_s3_object.supabase.key}"

  parameters = {
    Email                         = var.supabase_email
    SenderName                    = var.supabase_sender_name
    DisableSignup                 = var.supabase_disable_signup
    SiteUrl                       = var.supabase_site_url
    RedirectUrls                  = ""
    JwtExpiryLimit                = "3600"
    PasswordMinLength             = "8"
    AuthImageUri                  = "public.ecr.aws/supabase/gotrue:v2.153.0"
    RestImageUri                  = "public.ecr.aws/supabase/postgrest:v12.1"
    RealtimeImageUri              = "public.ecr.aws/supabase/realtime:v2.29.5"
    StorageImageUri               = "public.ecr.aws/supabase/storage-api:v1.3.3"
    ImgproxyImageUri              = "public.ecr.aws/supabase/imgproxy:v1.2.0"
    PostgresMetaImageUri          = "public.ecr.aws/supabase/postgres-meta:v0.81.1"
    EnableHighAvailability        = "false"
    WebAclArn                     = ""
    MinACU                        = "0.5"
    MaxACU                        = "16"
    SesRegion                     = "us-east-1"
    EnableWorkMail                = "false"
    KongTaskSize93C195E9          = "small"
    AuthTaskSize9895C206          = "small"
    AuthProvider1Name740DD3F6     = ""
    AuthProvider1ClientId5614D178 = ""
    AuthProvider1SecretAE54364F   = ""
    AuthProvider2Name573986E5     = ""
    AuthProvider2ClientIdF3685A2B = ""
    AuthProvider2Secret2662F55E   = ""
    AuthProvider3NameA8A7785F     = ""
    AuthProvider3ClientId8DF3C6F7 = ""
    AuthProvider3Secret29364F33   = ""
    RestTaskSize14E11A14          = "small"
    RealtimeTaskSize6077FE1F      = "small"
    ImgproxyTaskSize5D0DD9F6      = "small"
    StorageTaskSizeB82D9CFB       = "small"
    MetaTaskSize556D36D9          = "small"
    StudioBranch                  = "v1.24.04"
  }

  timeout_in_minutes = 0
  disable_rollback   = false
  capabilities       = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]

  on_failure = "DO_NOTHING"

  # This is a workaround
  lifecycle {
    ignore_changes = all
  }
}

resource "aws_s3_bucket" "supabase" {
  bucket = "${local.name}-utils"
}

resource "aws_s3_object" "supabase" {
  bucket      = aws_s3_bucket.supabase.bucket
  key         = "supabase.json"
  source      = "${path.module}/supabase.json"
  source_hash = filebase64sha256("${path.module}/supabase.json")
}
