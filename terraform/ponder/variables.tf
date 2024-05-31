# app_name
# vpc_id
# security_group_id

variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "security_group_id" {
  description = "The ID of the security group"
  type        = string
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "private_subnet_ids" {
  description = "The IDs of the private subnets"
  type        = list(string)
}

variable "postgres_secret_id" {
  description = "The secret for the Postgres database"
  type        = string
}

variable "ponder_secrets_id" {
  description = "The secret for the Ponder application"
  type        = string
}