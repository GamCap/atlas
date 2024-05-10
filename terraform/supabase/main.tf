resource "aws_cloudformation_stack" "supabase" {
  name         = "supabase"
  template_url = "https://s3.us-east-1.amazonaws.com/${aws_s3_bucket.supabase.bucket}/${aws_s3_object.supabase.key}"

  parameters = {
    Email                         = "noreply@gamcaplabs.com"
    SenderName                    = "GamCap Labs"
    DisableSignup                 = "false"
    SiteUrl                       = "http://localhost:3000"
    RedirectUrls                  = ""
    JwtExpiryLimit                = "3600"
    PasswordMinLength             = "8"
    AuthImageUri                  = "public.ecr.aws/supabase/gotrue:v2.110.0"
    RestImageUri                  = "public.ecr.aws/supabase/postgrest:v11.2.0"
    RealtimeImageUri              = "public.ecr.aws/supabase/realtime:v2.25.27"
    StorageImageUri               = "public.ecr.aws/supabase/storage-api:v0.43.11"
    ImgproxyImageUri              = "public.ecr.aws/supabase/imgproxy:v1.2.0"
    PostgresMetaImageUri          = "public.ecr.aws/supabase/postgres-meta:v0.74.2"
    EnableHighAvailability        = "false"
    WebAclArn                     = ""
    MinACU                        = "0.5"
    MaxACU                        = "16"
    SesRegion                     = "us-east-1"
    EnableWorkMail                = "false"
    KongTaskSize93C195E9          = "medium"
    AuthTaskSize9895C206          = "medium"
    AuthProvider1Name740DD3F6     = ""
    AuthProvider1ClientId5614D178 = ""
    AuthProvider1SecretAE54364F   = ""
    AuthProvider2Name573986E5     = ""
    AuthProvider2ClientIdF3685A2B = ""
    AuthProvider2Secret2662F55E   = ""
    AuthProvider3NameA8A7785F     = ""
    AuthProvider3ClientId8DF3C6F7 = ""
    AuthProvider3Secret29364F33   = ""
    RestTaskSize14E11A14          = "medium"
    RealtimeTaskSize6077FE1F      = "medium"
    ImgproxyTaskSize5D0DD9F6      = "medium"
    StorageTaskSizeB82D9CFB       = "medium"
    MetaTaskSize556D36D9          = "medium"
    StudioBranch                  = "v0.23.09"
  }

  timeout_in_minutes = 0
  disable_rollback   = false
  capabilities       = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]

  # This is a workaround
  lifecycle {
    ignore_changes = all
  }
}

resource "aws_s3_bucket" "supabase" {
  bucket = "${local.app_name}-supabase-utils"
}

resource "aws_s3_object" "supabase" {
  bucket      = aws_s3_bucket.supabase.bucket
  key         = "supabase.json"
  source      = "${path.module}/supabase.json"
  source_hash = filebase64sha256("${path.module}/supabase.json")
}
