provider "aws" {
  region = var.region

  default_tags {
    tags = module.tags.tags
  }
}