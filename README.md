# Botitude
Botitude is a slack application that can be used to issue Kudos Verifiable Credential to the users in your workspace. 

Kudos Verifiable Credentials are a tangible way to show appreciation to your colleagues for their work and achievements, and in turn, they will be able to share these Verifiable Credentials (VCs) online with others. 

Kudos VCs show the issue date and sender's name and can be personalized with a message as well.

# How does Botitude work?

 - Add the application to the workspace and in the channel, you want to use.
 - To issue a Kudos VC, start an interaction in the channel where the application is installed. For example, “Kudos to `@Amit` for helping me in the deployment process.” 
 - Botitude will respond to the message by starting a thread, where it will prompt you to confirm that you really want to issue a Kudos VC.
 - While writing the message, remember to tag whom you want to send the VCs to. If there are no tags Botitude will not reply.
 - Botitude responds to the messages in the channels and not in the thread.
 - It should be noted that whatever the user writes in the text will be used and displayed in the VC. Emojis are supported as well.
 - Once you post the message in the channel, Botitude will grab all the users that you have tagged in the message, fetch the emails of the users, and issue VCs to them.
 - The VCs are then shared with the users through emails to their respective email addresses.

### Setup 

 - Visit this [link](https://api.slack.com/apps) and create a slack application.
 - Visit this [link](https://apikey.affinidi.com/) and generate an API key for your application. NOTE: We are going to use `API Key Hash` attribute in the env.
 - Using this [API](https://www.affinidi.com/api#operation/SignUp) create an Issuer account.
 - In this application we have used redis to store installation information. You can read more about it [here](https://slack.dev/bolt-js/concepts#authenticating-oauth).
 - Create `.env` from `.env.example`. Copy all the content from the example file and paste it in the .env with proper vaules.

### Slack event listener
In order to run the bot locally on your machine, you need to install ngrok. Expose the port that was specified in the `.env file`.

```
ngrok http 3000
```
Using the public url given by ngrok, subscribe to the events through this [link](https://api.slack.com/apps). You need to repeat this everytime your local machine restarts or if you shut down ngrok.

Run the bot.
```
npm run start-listener
```