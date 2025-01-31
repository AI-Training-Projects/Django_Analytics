# Deliberate Practice App

This app was developed by 
SOURCE REPO: 

    https://github.com/seniorcodereviewbuddy/deliberate_practice/tree/main

Initial deliberate practice app repo for senior code review buddy.

To learn more about Senior Code Review Buddy, please visit https://seniorcodereviewbuddy.com

You can also visit the YouTube channel at https://www.youtube.com/@SeniorCodeReviewBuddy

## Local Setup

1) Download and install conda<br>
Probably from https://conda.io/projects/conda/en/latest/user-guide/install/index.html, if you don't already have it.
1) Create the Deliberate Practice conda environment<br>
Likely with the following command in a CLI "conda env create --file deliberate_practice.yml"
1) If desired, set the environment variable DELIBERATE_PRACTICE_CONDA_DIR to the newly created conda directory<br>
This can be used by Sublime to find the python executable to run, if desired

## Running Django Locally
To start the Django instance locally, run `python manage.py runserver`. By default
this will run the Deliberate Practice App at http://127.0.0.1:8000/practice. If you
have a super user, you can go to http://localhost:8000/admin/deliberate_practice_app/activity/
and create Activities to practice there.

### Creating a Super User

If you need/want to visit the admin page, you'll need to create a superuser. To do so, run `python manage.py createsuperuser`
with whatever values you desire. Current recommendation for local dev is to have user name and password as admin (ignore the
warnings about a weak password, this should only be ignored for local usage).

## Running Hooks Local

To run the hooks locally, you'll need to first install pre-commit with "pre-commit install", from inside
your Conda environment.

If you want a run just one hook, you can with "pre-commit run {hook_id}"

## Running Tests Locally

To run all the test locally just run pytest in the root directory.

For more details on how to work with pytest, look at https://docs.pytest.org/en/8.2.x/contents.html

## Using Docker

You can build an image with:
docker build -t <image_name> .

If you only want the instance to be visible on the local machine, you can run an image with:
docker run -p 127.0.0.1:8181:8181 <image_name>

If you only want the instance to be visible to other machines, you can run an image with:
docker run -p 8181:8181 <image_name>

If you want to change the ALLOWED_HOST value, put the comma seperated values into the DELIBERATE_PRACTICE_SERVER_NAMES environment variable.

Note, by default the docker image uses port 8181.

### Using Docker Compose

You can run the docker image through compose with the following helpful commands.

Start the image with:
docker compose up

If you want to force a rebuild, include --build.
If you want docker to rebuild if it sees a change, include --watch.
If you want to bring up the services in detached mode, include -d.
