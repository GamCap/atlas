variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "supabase_email" {
  description = "The email for the Supabase project"
  type        = string
}

variable "supabase_sender_name" {
  description = "The sender name for the Supabase project"
  type        = string
}

variable "supabase_disable_signup" {
  description = "Disable signups for the Supabase project"
  type        = bool
}

variable "supabase_site_url" {
  description = "The site URL for the Supabase project"
  type        = string
}