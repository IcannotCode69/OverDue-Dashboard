## OverDue Dashboard Deployment

Deploy the static build to Amazon S3 with `npm run deploy`. This section captures the prerequisites and exact steps.

### Prerequisites

- AWS account with the AWS CLI installed (`aws --version` should succeed).
- IAM user/role with permission to write to your target bucket (AmazonS3FullAccess is sufficient for prototypes).
- S3 bucket created and configured for static website hosting (set both `index.html` and `error.html` to `index.html`).
- Run `aws configure` locally so the CLI has credentials and default region.

### Environment variables

Set the bucket name before running the deploy script.

```powershell
# PowerShell (Windows, current session)
$env:AWS_S3_BUCKET_NAME = "your-bucket-name"
```

```bash
# Bash (macOS / Linux)
export AWS_S3_BUCKET_NAME=your-bucket-name
```

### Deployment steps

```bash
npm install      # first time
npm run deploy   # builds and syncs build/ to S3
```

The site is available at the "Static website hosting" endpoint shown on the bucket's **Properties** tab. Update DNS/CDN settings to point to that endpoint if needed.
