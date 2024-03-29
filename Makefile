.DEFAULT=deploy

SHELL=bash
AWS_DEFAULT_PROFILE=fibidev

comma:= ,
# TODO: create log command that shows logs of latest stream

.PHONY: dev-deps
dev-deps:
	npm install
	pip install pygments

.PHONY: logs
lambda-logs:
ifndef STREAM_NAMES
	@$(eval OPTS = )
else
	@$(eval OPTS = --log-stream-names $(STREAM_NAMES))
endif
	aws --profile fibidev --region us-east-1 \
		logs filter-log-events --log-group-name /aws/lambda/fibi $(OPTS) |\
		pygmentize -l json | grep message | grep -v END\ RequestId |\
		grep -v REPORT\ RequestId | grep -v START\ RequestId

.PHONY: latest-stream
latest-logs: CMD = \
	aws --profile fibidev --region us-east-1 \
		logs describe-log-streams --log-group-name /aws/lambda/fibi \
		--order-by LastEventTime |\
		grep logStreamName |\
		tail -n 1
latest-logs:
	$(eval LATEST_STREAM=$(subst $(comma),,$(word 2,$(shell $(CMD)))))
	aws --profile fibidev --region us-east-1 \
		logs filter-log-events --log-group-name /aws/lambda/fibi \
		--log-stream-names $(LATEST_STREAM) |\
		pygmentize -l json |\
		grep message | grep -v END\ RequestId |\
		grep -v REPORT\ RequestId | grep -v START\ RequestId

.PHONY: ls-log-streams
ls-log-streams:
	aws --profile fibidev --region us-east-1 \
		logs describe-log-streams --log-group-name /aws/lambda/fibi \
		--order-by LastEventTime |\
		pygmentize -l json |\
		grep logStreamName

.PHONY: set-timeout
set-timout:
	aws --profile $(AWS_DEFAULT_PROFILE) lambda update-function-configuration --function-name fibi --timeout $(T)

.PHONY: add-greeting
add-greeting:
	curl -X POST -H "Content-Type: application/json" -d '{ \
	  "setting_type":"greeting", \
	  "greeting":{ \
	    "text":"A chatbot to help immigrants find resources. Say hi!" \
	  } \
	}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=$(PAGE_ACCESS_TOKEN)"

.PHONY: add-getting-started
add-getting-started:
	curl -X POST -H "Content-Type: application/json" -d '{ \
	  "setting_type":"call_to_actions", \
	  "thread_state":"new_thread", \
	  "call_to_actions":[ \
	    { \
	      "payload":"START_OVER" \
	    } \
	  ] \
	}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=$(PAGE_ACCESS_TOKEN)"      

.PHONY: add-menu
add-menu:
	curl -X POST -H "Content-Type: application/json" -d '{ \
	  "setting_type" : "call_to_actions", \
	  "thread_state" : "existing_thread", \
	  "call_to_actions":[ \
	    { \
	      "type":"postback", \
	      "title":"Start over", \
	      "payload":"START_OVER" \
	    } \
	  ] \
	}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=$(PAGE_ACCESS_TOKEN)"

.PHONY: rm-menu
rm-menu:
	curl -X DELETE -H "Content-Type: application/json" -d '{ \
	  "setting_type":"call_to_actions", \
	  "thread_state":"existing_thread" \
	}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=$(PAGE_ACCESS_TOKEN)"

.PHONY: update-data
update-data:
	mv ~/Downloads/decision_tree_data\ -\ Sheet1.csv data/csv/decision_tree_data.csv
	npm run create-data
