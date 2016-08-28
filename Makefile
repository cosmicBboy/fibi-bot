.DEFAULT=deploy

deploy:
	claudia create --region us-east-1 --api-module bot --configure-fb-bot
