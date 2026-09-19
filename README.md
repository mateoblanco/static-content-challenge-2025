# Static Content challenge

**NB: Please do not fork this repository, to avoid your solution being visible from this repository's GitHub page. Please clone this repository and submit your solution as a separate repository.**

Business Scenario: Acme Co's marketing department want a simple content management system and you've been tasked with building the MVP.

The challenge here is to create a full-stack JavaScript application that returns webpages at URLs that match the paths of the folders and sub-folders in the `content` folder. The content of these pages should come from a combination of the template HTML file and a markdown file containing the content.

For example, for a folder called `about-page`, a request to `/about-page` would return a HTML page created from the `template.html` template and the `about-page/index.md` content file. The `template.html` file contains a `{{content}}` placeholder that would be replaced by the content for each page. A request to `/blog/june/company-update` would return a HTML page using the content file at `blog/june/company-update/index.md`.

As a modern full-stack JavaScript app MVP, the application should use an effective mix of technologies, although there is a requirement to use React on the front-end to fit in with Acme Co's other websites.

Acme's marketing department should be able to add extra folders to the `content` folder and the application should work with those without any requiring any code changes.

This repository contains a `template.html` template file and a sample `content` folder with sub-folders containing `index.md` markdown files (or other sub-folders).

Your application may make use of open-source code libraries and other third-party tools. It is entirely up to you how the application performs the challenge. As the use of LLMs is widespread in software engineering, you are permitted to use AI as you wish.

## Testing

The application should be shipped with at minimum three tests, although your testing strategy should effectively test your application:

- one that verifies that requests to valid URLs return a 200 HTTP status code
- one that verifies that requests to valid URLs return a body that contains the HTML generated from the relevant `index.md` markdown file
- one that verifies that requests to URLs that do not match content folders return a 404 HTTP status code
- NB: the tests should not depend on the existing sub-folders in the `content` folder, so the tests do not break as the content changes

## Bonus credit

**NB: This is only relevant if completing this task in your own time, i.e. NOT in a pairing interview**

In this MVP sprint, there are several opportunities to deliver nice-to-have tickets. The marketing team recognise that in a post-LLM world sprint velocity may be higher.

- The generated HTML page should be styled in a pleasing way
- The MVP's GitHub repository should be configured for hosting on a cloud hosting service, and include a link to a live deployment
- The repository should include documentation describing how to both use the application and how to iterate it from here
- Overall, you should do everything you think is necessary to make this application MVP production-ready
