variable "bucket_name" {
  description = "Name of the existing S3 bucket to deploy to"
  type        = string
}

variable "region" {
  description = "AWS region where the bucket lives"
  type        = string
  default     = "us-east-1"
}

variable "build_dir" {
  description = "Local directory containing the built frontend to upload (relative to repo root or absolute path)"
  type        = string
  default     = "dist"
}

variable "aws_profile" {
  description = "Optional AWS CLI profile to use (leave empty to use environment credentials)"
  type        = string
  default     = ""
}

variable "acl" {
  description = "ACL to apply to uploaded objects, set empty to skip. Default is empty (no ACL)"
  type        = string
  default     = ""
}
