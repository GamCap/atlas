provider "aws" {
    region  = "us-east-1"

    default_tags {
        tags = module.tags.tags
    }
}