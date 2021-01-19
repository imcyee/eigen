SHELL := /usr/bin/env bash
WORKSPACE = Artsy.xcworkspace
SCHEME = Artsy
SCHEME_INTEGRATION_TESTS = 'Artsy Integration Tests'
CONFIGURATION = Beta
DEVICE_HOST = platform='iOS Simulator',OS='14.2',name='iPhone 12 Pro'
# Disable warnings as errors for now, because we’re currently not getting the same errors during dev as deploy.
# OTHER_CFLAGS = OTHER_CFLAGS="\$$(inherited) -Werror"

DATE_MONTH = $(shell date "+%e %h" | tr "[:lower:]" "[:upper:]")

LOCAL_BRANCH := $(git rev-parse --abbrev-ref HEAD)
BRANCH = $(shell echo host=github.com | git credential fill | sed -E 'N; s/.*username=(.+)\n?.*/\1/')-$(shell git rev-parse --abbrev-ref HEAD)

## Lets us use circle caching for build artifacts
DERIVED_DATA = -derivedDataPath derived_data
RESULT_BUNDLE = -resultBundlePath derived_data/result_bundle

.PHONY: all build ci test oss pr artsy

all: ci

### Aliases

next:
	bundle e fastlane update_version_string

### General setup

oss:
	touch .env.ci
	cp .env.example .env.shared

artsy:
	touch .env.ci
	aws s3 cp s3://artsy-citadel/dev/.env.eigen .env.shared

certs:
	@echo "Don't log in with it@artsymail.com, use your account on our Artsy team."
	bundle exec match appstore

distribute_setup: setup_fastlane_env
	brew update
	brew tap getsentry/tools
	brew install sentry-cli
	bundle exec fastlane update_plugins

distribute_ios: distribute_setup
	bundle exec fastlane ship_beta_ios

distribute_android: distribute_setup
	bundle exec fastlane ship_beta_android

distribute: distribute_setup
	bundle exec fastlane ship_beta

setup_fastlane_env:
	rm -f Gemfile.lock
	bundle install

### General Xcode tooling

build:
	set -o pipefail && xcodebuild -workspace $(WORKSPACE) -scheme $(SCHEME) -configuration '$(CONFIGURATION)' -sdk iphonesimulator build -destination $(DEVICE_HOST) $(DERIVED_DATA) | tee ./xcode_build_raw.log | bundle exec xcpretty -c

build-for-tests-ios:
	set -o pipefail && xcodebuild -workspace $(WORKSPACE) -scheme $(SCHEME) -configuration Debug -sdk iphonesimulator build -destination $(DEVICE_HOST) $(DERIVED_DATA) | tee ./xcode_build_raw.log | bundle exec xcpretty -c

build-for-tests-android:
	npx jetifier
	cd android; ./gradlew buildRelease; cd -

test-ios:
	set -o pipefail && xcodebuild -workspace $(WORKSPACE) -scheme $(SCHEME) -configuration Debug test -sdk iphonesimulator -destination $(DEVICE_HOST) $(DERIVED_DATA) $(OTHER_CFLAGS) | bundle exec second_curtain 2>&1 | tee ./xcode_test_raw.log  | bundle exec xcpretty -c --test --report junit --output ./test-results.xml

test-android:
	# cd android; ./gradlew test; cd -
	# For now, we don't have any native tests, let's just return 0.
	exit 0

# This is currently not being called from our CI yaml file [!]
uitest:
	set -o pipefail && xcodebuild -workspace $(WORKSPACE) -scheme $(SCHEME_INTEGRATION_TESTS) -configuration Debug test -sdk iphonesimulator -destination $(DEVICE_HOST) $(DERIVED_DATA) $(RESULT_BUNDLE) | bundle exec second_curtain 2>&1 | tee $,./xcode_uitest_raw.log  | bundle exec xcpretty -c --test --report junit --output ./xcode-results.xml

### CI

ci-ios:
	if [ "${LOCAL_BRANCH}" != "beta-ios" ] && [ "${LOCAL_BRANCH}" != "app_store_submission" ]; then make build-for-tests-ios; else echo "Skipping test build on beta deploy."; fi

ci-android:
	if [ "${LOCAL_BRANCH}" != "beta-android" ] && [ "${LOCAL_BRANCH}" != "app_store_submission" ]; then make build-for-tests-android; else echo "Skipping test build on beta deploy."; fi

ci-test-ios:
	if [ "${LOCAL_BRANCH}" != "beta-ios" ] && [ "${LOCAL_BRANCH}" != "app_store_submission" ]; then make test-ios; else echo "Skipping test run on beta deploy."; fi

ci-test-android:
	if [ "${LOCAL_BRANCH}" != "beta-android" ] && [ "${LOCAL_BRANCH}" != "app_store_submission" ]; then make test-android; else echo "Skipping test run on beta deploy."; fi

deploy_if_beta_branch_ios:
	if [ "${LOCAL_BRANCH}" == "beta-ios" ]; then make distribute_ios; fi

deploy_if_beta_branch_android:
	if test "${LOCAL_BRANCH}" = "beta-android"; then echo wowww; fi
	if test "$(LOCAL_BRANCH)" = "beta-android"; then echo wow1; fi
	if [ "$(LOCAL_BRANCH)" == "beta-android" ]; then echo wow2; fi
	if [ "${LOCAL_BRANCH}" == "beta-android" ]; then echo wow3; fi

deploy-ios:
	git push origin "${LOCAL_BRANCH}:beta-ios" -f --no-verify

deploy-android:
	git push origin "${LOCAL_BRANCH}:beta-android" -f --no-verify

deploy: deploy-ios deploy-android

### App Store Submission

promote_beta_to_submission:
	git push origin "${LOCAL_BRANCH}:app_store_submission" -f --no-verify

promote_if_app_store_submission_branch:
	if [ "${LOCAL_BRANCH}" == "app_store_submission" ]; then make _promote_beta; fi

_promote_beta: setup_fastlane_env
	bundle exec fastlane update_plugins
	bundle exec fastlane promote_beta

notify_if_new_license_agreement: setup_fastlane_env
	bundle exec fastlane update_plugins
	bundle exec fastlane notify_if_new_license_agreement

### Utility functions

stamp_date:
	config/stamp --input Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-60@2x.png --output Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-60@2x.png --text "$(DATE_MONTH)"
	config/stamp --input Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-76.png --output Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-76.png --text "$(DATE_MONTH)"
	config/stamp --input Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-76@2x.png --output Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-76@2x.png --text "$(DATE_MONTH)"
	config/stamp --input Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-Small-40.png --output Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-Small-40.png --text "$(DATE_MONTH)"
	config/stamp --input Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-Small-40@2x.png --output Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-Small-40@2x.png --text "$(DATE_MONTH)"
	config/stamp --input Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-Small-40@2x-1.png --output Artsy/Resources/Images.xcassets/AppIcon.appiconset/Icon-Small-40@2x-1.png --text "$(DATE_MONTH)"

update_echo:
	# The @ prevents the command from being printed to console logs.
	# Touch both files so dotenv will work.
	@curl https://echo.artsy.net/Echo.json > Artsy/App/EchoNew.json
	yarn prettier -w Artsy/App/EchoNew.json

storyboards:
	swiftgen storyboards Artsy --output Artsy/Tooling/Generated/StoryboardConstants.swift
	swiftgen images Artsy --output Artsy/Tooling/Generated/StoryboardImages.swift

### Useful commands

pr:
	if [ "${LOCAL_BRANCH}" == "master" ]; then echo "In master, not PRing"; else git push -u origin "${LOCAL_BRANCH}:$(BRANCH)"; open "https://github.com/artsy/eigen/pull/new/artsy:master...$(BRANCH)"; fi

push:
	if [ "${LOCAL_BRANCH}" == "master" ]; then echo "In master, not pushing"; else git push origin ${LOCAL_BRANCH}:$(BRANCH); fi

fpush:
	if [ "${LOCAL_BRANCH}" == "master" ]; then echo "In master, not pushing"; else git push origin ${LOCAL_BRANCH}:$(BRANCH) --force --no-verify; fi

# Clear local caches and build files
flip_table:
	@echo 'Clear node modules (┛ಠ_ಠ)┛彡┻━┻'
	rm -rf node_modules
	@echo 'Clear cocoapods directory (ノಠ益ಠ)ノ彡┻━┻'
	rm -rf Pods
	@echo 'Clear Xcode derived data (╯°□°)╯︵ ┻━┻'
	# sometimes this fails on first try even with -rf
	# but a second try takes it home
	if ! rm -rf ~/Library/Developer/Xcode/DerivedData; then rm -rf ~/Library/Developer/Xcode/DerivedData; fi
	@echo 'Clear gradle cache'
	cd android; ./gradlew clean cleanBuildCache; cd -
	@echo 'Clear relay, jest, and metro caches (┛◉Д◉)┛彡┻━┻'
	rm -rf $(TMPDIR)/RelayFindGraphQLTags-*
	rm -rf .jest
	rm -rf $(TMPDIR)/metro* .metro
	@echo 'Clear build artefacts (╯ರ ~ ರ）╯︵ ┻━┻'
	rm -rf emission/Pod/Assets/Emission*
	rm -rf emission/Pod/Assets/assets
	@echo 'Reinstall dependencies ┬─┬ノ( º _ ºノ)'
	$(MAKE) update_echo
	bundle exec pod install --repo-update

# Clear global and local caches and build files
flip_table_extreme:
	@echo 'Clean global yarn & pod caches (┛✧Д✧))┛彡┻━┻'
	yarn cache clean
	bundle exec pod cache clean --all
	$(MAKE) flip_table
