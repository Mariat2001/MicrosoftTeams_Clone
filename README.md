<p align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/6295/6295417.png" width="100" />
</p>
<p align="center">
    <h1 align="center">Movie App</h1>
</p>


<p align="center">
		<em>Developed with the software and tools below.</em>
</p>
<p align="center">
	<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" alt="JavaScript">
	<img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=flat&logo=HTML5&logoColor=white" alt="HTML5">
	<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" alt="React">
	<img src="https://img.shields.io/badge/Express.js-404D59.svg?style=flat&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/CSS3-1572B6.svg?style=flat&logo=CSS3&logoColor=white" alt="CSS3">


</p>
<p>This a Movie App that contains a register page and a page of a list of movies and it can add a favorite movie to the favorites page.</p>
<hr>

##  Getting start
1. Create the movieapp database in phpmyadmin containing these followinf tables:
   
```sh
favorites -> columns: id/user_id/movie_id/title/poster_path/release_date/status 
```
```sh
users -> columns: id/name/email/password/phone/created_at/ 
```
ps:id should be auto incremented.

2. Clone the movie_app repository:

```sh
git clone https://github.com/Mariat2001/movie_app
```
3. Change to the project directory:

```sh
cd movie_app
```
  A-***Frontend Setup***
  
1. In the Movie_App run this the Frontend Folder following these steps:

```sh
1. Navigate to the frontend folder:
   cd Frontend_app
```
```sh
1. Install dependencies:
    npm install
```
```sh
2. Run the development server:
    npm run dev
```

  B-***Backend Setup***
1. In the Movie_App run this the Backend Folder following these steps:

```sh
1. Navigate to the backend folder:
   cd Backend_app
```

```sh
2. Express: For creating the server and handling HTTP requests:
   npm install express
```

```sh
3. MySQL: For connecting to and interacting with a MySQL database:
  npm install mysql
```

```sh
4. CORS: Allows the frontend to communicate with the backend:
   npm install cors
```

```sh
5. Bcrypt: For hashing passwords securely:
    npm install bcrypt
```

```sh
6. dotenv: To manage environment variables securely (JWT secrets):
   npm install dotenv
```

```sh
7. jsonwebtoken: For generating and verifying JSON Web Tokens (JWT) for authentication:
   npm install jsonwebtoken
```

```sh
8. Nodemon: Automatically restarts the server when code changes are detected:
  npm install --save-dev nodemon
```

