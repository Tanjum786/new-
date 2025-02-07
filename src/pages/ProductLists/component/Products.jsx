import React, { useState, useEffect } from "react";
import axios from "axios";
import { Categoryfun, RangeFun, RatingFun, SortpriceFun } from "../../../utils";
import { imgWarning } from "../../../assets/images";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "../../../components";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useFilter, useProducts } from "../../../Context";
import {
  addTocart,
  addToWishlist,
  removeFromWishlist,
} from "../../../Apicalls";
import { searchfilter } from "../../../utils/searchfilter";

export const Products = ({ searchQurey }) => {
  const { filterState } = useFilter();
  const { productState, productDispatch } = useProducts();
  const [loading, setloading] = useState(false);
  const { wishList } = productState;
  const [res, setRes] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("users");

  const { cart } = productState;

  const dataFetch = async () => {
    setloading(true);
    const response = await axios.get("/api/products");
    setRes(response.data.products);
    setloading(false);
  };
  useEffect(dataFetch, []);

  const addToWishlistHandler = (product) => {
    const checkwishlist = wishList?.some((item) => item._id === product._id);
    if (token && user) {
      if (!checkwishlist) {
        addToWishlist(product, token, productDispatch);
        Toast(`successfully added ${product.title} to the wishlist`, "success");
      }
    } else {
      navigate("/login");
      Toast("Your are not logedin", "warning");
    }
  };

  const addtoCartHandler = (product) => {
    if (token && user) {
      addTocart(product, token, productDispatch);
      Toast(`successfully added ${product.title} to the cart`, "success");
    } else {
      navigate("/login");
      Toast("Your are not logedin", "warning");
    }
  };

  const removeWishlistHandler = (_id) => {
    removeFromWishlist(_id, token, productDispatch);
  };

  const SortProduct = SortpriceFun(res, filterState);
  const RatingProduct = RatingFun(SortProduct, filterState);
  const RangeProduct = RangeFun(RatingProduct, filterState);
  const CategoryProduct = Categoryfun(RangeProduct, filterState);
  const searchFilterProduct = searchfilter(CategoryProduct, searchQurey);
  return (
    <>
      <div className="product_card_list">
        {!loading ? (
          <>
            <h1 className="products_title">
              Showing All Products ({searchFilterProduct.length})
            </h1>
            <div className="title_underline"> </div>
          </>
        ) : (
          <h1 className="products_title">Loading....</h1>
        )}
        {filterState.PriceValue <= 50 ? (
          <div className="warning-image-div dis_flex">
            <img src={imgWarning} alt="warningImg" className="imgwarning" />
          </div>
        ) : (
          <div className="all_cards_container dis_flex">
            {searchFilterProduct.length !== 0 ? (
              searchFilterProduct.map(
                ({ img, rating, title, price, _id, Quantity }) => {
                  const isaddedTocart = cart.some((item) => item._id === _id);

                  return (
                    <div className="product_card bg_color" key={_id}>
                      <div className="product_card_img">
                        <div className="product_wishlist_icon dis_flex">
                          {wishList?.some((item) => item._id === _id) ? (
                            <AiFillHeart
                              size="1.4rem"
                              className="wishlist_btn color-btn"
                              onClick={() => removeWishlistHandler(_id)}
                            />
                          ) : (
                            <AiOutlineHeart
                              size="1.4rem"
                              className="wishlist_btn color-btn"
                              onClick={() =>
                                addToWishlistHandler({
                                  img,
                                  rating,
                                  title,
                                  price,
                                  _id,
                                  Quantity,
                                })
                              }
                            />
                          )}
                        </div>
                        <img
                          src={img}
                          alt="product-image"
                          className="img_size"
                        />
                      </div>
                      <div className="rating_container">
                        <span className="rating">
                          <i className="fas fa-star icon_star"></i> {rating}
                        </span>
                      </div>
                      <div className="product_card_details gap_s dis_flex">
                        <span>{title}</span>
                        <h3>₹ {price}</h3>
                      </div>
                      <div>
                        {isaddedTocart ? (
                          <Link to="/cart">
                            <button className="add_to_cart bg_color padding_small">
                              Go To Cart
                            </button>
                          </Link>
                        ) : (
                          <button
                            onClick={() =>
                              addtoCartHandler({
                                img,
                                _id,
                                title,
                                price,
                                Quantity,
                                rating,
                              })
                            }
                            className="add_to_cart bg_color padding_small"
                          >
                            Add To Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              !loading?<h1 className="waring-massage">No such products Exists</h1>:""
            )}
          </div>
        )}
      </div>
    </>
  );
};
