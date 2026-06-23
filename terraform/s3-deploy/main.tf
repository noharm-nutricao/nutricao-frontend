terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.region
  profile = var.aws_profile != "" ? var.aws_profile : null
}

variable "cloudfront_distribution_id" {
  type        = string
  description = "O ID da distribuicao do CloudFront (ex: E1234567ABCDEF)"
}

# verify the bucket exists
data "aws_s3_bucket" "target" {
  bucket = var.bucket_name
}

resource "null_resource" "deploy" {
  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command = format(
      "aws s3 sync \"%s\" \"s3://%s\" --delete --region %s%s%s && aws cloudfront create-invalidation --distribution-id %s --paths \"/*\" --region %s%s",
      var.build_dir,
      var.bucket_name,
      var.region,
      var.aws_profile != "" ? format(" --profile %s", var.aws_profile) : "",
      var.acl != "" ? format(" --acl %s", var.acl) : "",
      var.cloudfront_distribution_id,
      var.region,
      var.aws_profile != "" ? format(" --profile %s", var.aws_profile) : ""
    )
    
    environment = {
      AWS_DEFAULT_REGION = var.region
    }
  }
}