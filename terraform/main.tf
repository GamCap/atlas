locals {
    app_name = "worldcoin"
}

module "tags" {
  source = "./tags"

  application = local.app_name
  env         = terraform.workspace
}