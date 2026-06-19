import mongoose from "mongoose";

let cachedConnection = null;

const ConnectionDB = async () => {

    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        const conn = await mongoose.connect(process.env.DataBaseURI, {
  
            serverSelectionTimeoutMS: 5000, 
        });

        cachedConnection = conn;
        console.log("Connected Successfully :)");
        return conn;
    } catch (err) {
        console.log("==>Error From DataBase", err);
        throw err; 
    }
};

export default ConnectionDB;