import mongoose from "mongoose";
import { commentSchema } from './model/commentModel';
import { authorSchema } from './model/authorModel';
import { articleSchema } from "./model/articleModel";
import { userSchema } from "./model/userModel";
import { ticketSchema } from "./model/ticketModel";
import { productSchema } from "./model/productModel";
import { orderSchema } from "./model/orderModel";
import { linkSchema } from "./model/linkModel";
import { codeSchema } from "./model/codeModel";
import { checkoutSchema } from "./model/checkoutModel";

const dbConnect = async () => {
  try {

    if (mongoose.connections[0].readyState) {
      return false
    }
    await mongoose.connect("mongodb://neynegar_shop:malek0079@neynegar1.ir:27017/neynegar_DB?authMechanism=SCRAM-SHA-256")
    console.log("*** DB is connected successfuly ***");

    // ثبت مدل comments در صورت نیاز
    if (!mongoose.models.comments) {
      mongoose.model("comments", commentSchema);
    }

    // ثبت مدل authors در صورت نیاز
    if (!mongoose.models.authors) {
      mongoose.model("authors", authorSchema);
    }

    // ثبت مدل articles در صورت نیاز
    if (!mongoose.models.articles) {
      mongoose.model("articles", articleSchema);
    }

    // ثبت مدل users در صورت نیاز
    if (!mongoose.models.users) {
      mongoose.model("users", userSchema);
    }

    // ثبت مدل tickets در صورت نیاز
    if (!mongoose.models.tickets) {
      mongoose.model("tickets", ticketSchema);
    }

    // ثبت مدل products در صورت نیاز
    if (!mongoose.models.products) {
      mongoose.model("products", productSchema);
    }

    // ثبت مدل orders در صورت نیاز
    if (!mongoose.models.orders) {
      mongoose.model("orders", orderSchema);
    }

    // ثبت مدل links در صورت نیاز
    if (!mongoose.models.links) {
      mongoose.model("links", linkSchema);
    }

    // ثبت مدل codes در صورت نیاز
    if (!mongoose.models.codes) {
      mongoose.model("codes", codeSchema);
    }

    // ثبت مدل checkouts در صورت نیاز
    if (!mongoose.models.checkouts) {
      mongoose.model("checkouts", checkoutSchema);
    }

  } catch (error) {
    console.log("*** error in DB connection ==> ", error, " ***");
  }
}

export default dbConnect;