# How to obtain the credentials for the Criteo source

To connect to the Criteo API, follow the steps below to create an app and generate the necessary credentials.

Go to [https://partners.criteo.com](https://partners.criteo.com) and log in with your Criteo account.

Create a new app by clicking the ➕ icon in the **My Apps** section or by pressing the **Create a new app** button.  

![Criteo Create App](res/criteo_createapp.png)

Enter a descriptive **Application Name** (e.g., `P2PDigital Data Marts`).  
> 📌 It's recommended to use a clearly identifiable name to simplify future troubleshooting.

Optionally, add a description. Click **Next**.

![Criteo App Name](res/criteo_appname.png)

Select **Client Credentials** as the authentication method.  

![Criteo Client Auth](res/criteo_clientauth.png)

Under **Service**, choose **C-Growth and marketing solutions**.  

![Criteo Service](res/criteo_service.png)

Choose the necessary **permissions** for your app:

- **Analytics — Read**
- **Campaigns — Read**
- **Creatives — Read**

These are the minimum required permissions for data access.

> ⚠️ **Note:** After completing this step, you will no longer be able to edit the app name, description, image, or scope.

Click **Activate app** to proceed.  

![Criteo Activate](res/criteo_activate.png)

Click **Create new key** to generate your `client_id` and `client_secret`.  
This will download a `.txt` file containing your credentials.

> 🔐 Make sure to store the keys in a secure location — they will be needed for API authentication.  

![Criteo New Key](res/criteo_newkey.png)

Click **Generate new URL**, then click the **Copy** icon next to the **Consent URL** field.  

![Criteo Consent URL](res/criteo-consenturl.gif)

Paste the copied **Consent URL** into your browser and follow the prompt to grant access to your application.

---

Once access is granted, you now have all the necessary credentials (`client_id`, `client_secret`, and app authorization) to use it as described in the [Getting Started guide](GETTING_STARTED.md).

## Troubleshooting and Support

If you encounter any issues:

1. Please [visit Q&A](https://github.com/vanhao1997/p2pdigital-data-marts/discussions/categories/q-a) first
2. If you want to report a bug, please [open an issue](https://github.com/vanhao1997/p2pdigital-data-marts/issues)
3. Join the [discussion forum](https://github.com/vanhao1997/p2pdigital-data-marts/discussions) to ask questions or propose improvements
