variable "backend_hostname" {
  type    = string
  default = "app.terraform.io"
}

variable "organization" {
  type    = string
}

variable "workspace_prefix" {
  type    = string
}

variable "region" {
  type    = string
  default = "us-east-1"
}