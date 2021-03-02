---
sidebar: auto
---

# Vuepress

There are several advantages to using a static site generator such as VuePress. With VuePress, you can focus on writing content using markdown, and the VuePress application generates static HTML files. VuePress also turns your content into a single-page application (SPA), so transitions between pages seem instant and seamless. The generated static files can be cached and distributed across a content delivery network (CDN) for even more performance. For the reader, VuePress creates a great experience.

However, a "static" site does not mean you cannot add dynamic touches to your content. In this tutorial, you will learn how to customize VuePress to create a personalized experience based on the person currently viewing the content.

## Install VuePress
Note: To complete this tutorial, you must have Node.js version 8 or higher installed, and a good text/code editor such as Visual Studio Code.

The first step is to create a new folder on your computer for the VuePress project. Name it anything you like. VuePress is a command-line interface (CLI) application. Therefore, you will need to open your terminal (macOS or Linux) or command prompt (Windows). Change the current directory at your command line (terminal or command prompt) to the folder you created for the project. Next, use `npm` to initialize this folder.

```
npm init -y
```

Now install VuePress using `npm`.

```
npm install vuepress@0.14
```

Next, you need to add a couple of commands to the project for running your local VuePress website and building the application. Open your project folder in the code editor of your choice. Edit the `package.json` file and change the section labeled `"scripts"` to the following.

```js
  "scripts": {
    "build": "vuepress build .",
    "dev": "vuepress dev ."
  },
```

Create a new file in the project folder named readme.md. Open this file and add the following markdown content.

```md
# Hello VuePress

This is going to be awesome!
```

Now run the following command at the command line.

```
npm run dev
```

Navigate in your browser to [`http://localhost:8080`](http://localhost:8080). You should see something like this screenshot.

<img src="https://scotch-res.cloudinary.com/image/upload/dpr_2,w_800,q_auto:good,f_auto/v1555455964/qfeiddpaipvlawwubchg.jpg" width="100%">

You now have a running VuePress application!

One of the excellent features of VuePress is it automatically updates your locally-running application with any changes you make. To demonstrate, leave the development server running at the command line. Make a change to `readme.md` file and save it. When you return to the browser, you should immediately see that change reflected without having to refresh the page!


## Configure Vuepress

Much of VuePress is customizable through [configuration](https://vuepress.vuejs.org/config/). In this step, you will configure your VuePress application to add a title and basic navigation.

Create a new folder in the project named `.vuepress`. Notice the period in front of the text, which is required. In the `.vuepress` folder, create a new file named `config.js`.

```js[config.js]
module.exports = {
  title: "My Documentation Site",
  description: "This is going to be awesome!",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "About", link: "/about/" }
    ]
  }
};
```

Go back to your browser and view [http://localhost:8080](http://localhost:8080). You should now see an updated header with the title and navigation!

<img src="https://scotch-res.cloudinary.com/image/upload/dpr_2,w_800,q_auto:good,f_auto/v1555456027/lkjun3jjrhjzvpytq9rr.jpg" width="100%">

