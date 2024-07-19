const http = require("http");
const fs = require("fs");
const url = require("url");
const db = require("./db.json");
require("dotenv").config()

const server = http.createServer((req, res) => {
  if (req.method == "PUT" && req.url.startsWith("/api/books")) {
    const ParsedUrl = url.parse(req.url, true);
    const bookID = ParsedUrl.query.id;
    let bookNewINfo = "";
    req.on("data", (data) => {
      bookNewINfo = bookNewINfo + data.toString();
    });
    req.on("end", () => {
      const reqBody = JSON.parse(bookNewINfo);
      db.Books.forEach((book) => {
        if (book.id == Number(bookID)) {
          book.title = reqBody.title;
          book.author = reqBody.author;
          book.price = reqBody.price;
        }
      });
      fs.writeFile("./db.json", JSON.stringify(db), (err) => {
        if (err) {
          throw err;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "book updated" }));
        res.end();
      });
    });
  } else if (req.method == "POST" && req.url.startsWith("/api/userRegister")) {
    let userInfo = "";

    req.on("data", (data) => {
      userInfo = userInfo + data.toString();
    });

    req.on("end", () => {
      const { name, Username, email } = JSON.parse(userInfo);

      const userExist = db.Users.find(
        (user) => user.email == email || user.Username == Username
      );
      if (name == "" || Username == "" || email == "") {
        res.writeHead(422, { "Contetnt-type": "application/json" });
        res.write(JSON.stringify({ message: "user not valid" }));
        res.end();
      } else if (userExist) {
        res.writeHead(409, { "Contetnt-type": "application/json" });
        res.write(JSON.stringify({ message: "user Exist" }));
        res.end();
      } else {
        const newUser = {
          id: crypto.randomUUID(),
          name,
          Username,
          email,
          role: "USER",
        };
        db.Users.push(newUser);
        fs.writeFile("./db.json", JSON.stringify(db), (err) => {
          if (err) {
            throw err;
          }
          res.writeHead(200, { "Contetnt-type": "application/json" });
          res.write(JSON.stringify({ message: "user added successfully" }));
          res.end();
        });
      }
    });
  } else if (req.method == "PUT" && req.url.startsWith("/api/userCrimeSet")) {
    let reqBodyC = "";
    const parsedUrl = url.parse(req.url, true);
    const userID = parsedUrl.query.id;
    req.on("data", (data) => {
      reqBodyC = reqBodyC + data.toString();
    });
    req.on("end", () => {
      const { crime } = JSON.parse(reqBodyC);
      db.Users.forEach((user) => {
        if (user.id == Number(userID)) {
          user.crime = crime;
        }
      });
      fs.writeFile("./db.json", JSON.stringify(db), (err) => {
        if (err) {
          throw err;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "crime set successfuly" }));
        res.end();
      });
    });
  } else if (req.method == "PUT" && req.url.startsWith("/api/userUpgrade")) {
   const parsedUrl = url.parse(req.url , true) 
   const userID = parsedUrl.query.id;
   db.Users.forEach((user) => {
      if(user.id == Number(userID)) {
         user.role = "ADMIN"
      }
   })
   fs.writeFile("./db.json" , JSON.stringify(db) , (err) => {
      if (err) {
         throw err
      }
      res.writeHead(200 , {"Content-Type" : "application/json"})
      res.write(JSON.stringify({message: "role changed"}))
      res.end()
   })
  } else if (req.method == "POST" && req.url.startsWith("/api/userLogin")) {
    let user = "";
    req.on("data", (data) => {
      user = user + data.toString();
    });
    req.on("end" , () => {
      const {Username , email} = JSON.parse(user)
      
         const userExist = db.Users.find(
          (user) => user.Username == Username && user.email == email
         )
        if (userExist) {
          res.writeHead(200 , {"Content-Type" : "application/json"})
          res.write(JSON.stringify({Username : userExist.Username , email : userExist.email}))
          res.end()
        } else {
          res.writeHead(401 , {"Content-Type" : "application/json"})
          res.write(JSON.stringify({message:"user not found"}))
          res.end()
        }
     
    })

  } else if (req.method == "POST" && req.url.startsWith("/api/rentBook")) {
    let reqBodyR = ""
    req.on("data" , (data) => {
      reqBodyR = reqBodyR + data.toString()
    })
    req.on("end" , () => {
    let {BookID , UserID} = JSON.parse(reqBodyR)
    const isFreeBook = db.Books.some(
      (book) => book.id == BookID && book.free == 1
    )
    if (isFreeBook) {
      db.Books.forEach((book)=> {
        if(book.id == Number(BookID)) {
          book.free = 0
        }
      })
      const newRent = {
        id :crypto.randomUUID(),
        BookID,
        UserID,
      }
      db.rents.push(newRent)
      fs.writeFile("./db.json" , JSON.stringify(db) , (err) => {
        if(err) {
          throw err
        }
        res.writeHead(201 , {"Content-Type":"application/json"})
        res.write(JSON.stringify({message:"book reserved successfully"}))
        res.end()
      })
    } else {
      res.writeHead(401 , {"Content-Type":"application/json"})
      res.write(JSON.stringify({message:"book is not free"}))
      res.end()
    }
   

    })

  }
});

server.listen(process.env.PORT, () => {
  console.log(`server runing on port => ${process.env.PORT}`);
});
