resource "aws_cloudformation_stack" "supabase" {
  
  name          = "supabase"
  template_body = file("${path.module}/supabase.json")

  parameters = {
    Email                         = "noreply@gamcaplabs.com"
    SenderName                    = "Supabase"
    RealtimeTaskSize6077FE1F      = "medium"
    MetaTaskSize556D36D9          = "medium"
    KongTaskSize93C195E9          = "medium"
    AuthTaskSize9895C206          = "medium"
    ImgproxyTaskSize5D0DD9F6      = "medium"
    RestImageUri                  = "public.ecr.aws/supabase/postgrest:v11.2.0"
    PostgresMetaImageUri          = "public.ecr.aws/supabase/postgres-meta:v0.74.2"
    ImgproxyImageUri              = "public.ecr.aws/supabase/imgproxy:v1.2.0"
    AuthImageUri                  = "public.ecr.aws/supabase/gotrue:v2.110.0"
    StorageImageUri               = "public.ecr.aws/supabase/storage-api:v0.43.11"
    StudioBranch                  = "v0.23.09"
    AuthProvider2Name573986E5     = ""
    AuthProvider3ClientId8DF3C6F7 = ""
    PasswordMinLength             = "8"
    WebAclArn                     = ""
    AuthProvider3Secret29364F33   = ""
    AuthProvider1ClientId5614D178 = ""
    EnableHighAvailability        = "false"
    DisableSignup                 = "false"
    MaxACU                        = "32"
    MinACU                        = "0.5"
    AuthProvider3NameA8A7785F     = ""
    JwtExpiryLimit                = "3600"
    AuthProvider2Secret2662F55E   = ""
    SiteUrl                       = "http://localhost:3000"
    AuthProvider2ClientIdF3685A2B = ""
  }

  capabilities = ["CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
}
