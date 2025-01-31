# Create Runtime Environment and Startup Application

1) Create conda environment: 

conda create --name django_analytics python=3.10 conda pip
conda activate django_analytics

pip install django-slick-reporting
pip install sqlalchemy>=2.0 ipython-sql
pip install sqlalchemy>=2.0
pip install ipython-sql
pip install watermark
pip install django-crispy-forms crispy-bootstrap5


# After installing django-slick-reporting dependencies: 

2) Navigate to the demo project directory:
    
    $ cd demo_proj

3) Apply database migrations:

    $ python manage.py migrate

4) Collect static files:

    $ python manage.py collectstatic

5) Run the development server:
    
    $ python manage.py runserver

# Steps to start up the demo application in the django-slick-reporting repository:


