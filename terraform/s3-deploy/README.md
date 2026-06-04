Usage

Prerequisites:
- Terraform installed (1.0+)
- AWS CLI installed and authenticated (env credentials or named profile)

Steps:

1. From repo root, initialize terraform in the module folder:

   cd terraform/s3-deploy
   terraform init

2. Plan / apply (set the bucket name and region):

   npm run build
   terraform plan -var="bucket_name=site-nitra" -var="region=us-east-2" 
   terraform apply -var="bucket_name=site-nitra" -var="region=us-east-2"


What this does:
- Verifies the bucket exists
- Runs `aws s3 sync <build_dir>` to upload files from the build directory (default: dist) to the specified S3 bucket

Notes:
- The deploy step uses the machine running `terraform apply` (local-exec + AWS CLI). Ensure appropriate AWS credentials are available there (env vars or profile).
- To run from CI, ensure the runner has AWS credentials and the AWS CLI installed.
- If you prefer Terraform-native uploads (aws_s3_object for each file) or CloudFront invalidation, say so and an alternative module can be provided.
