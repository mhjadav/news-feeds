import React, { useEffect, useState } from 'react';
import { graphql } from 'gatsby';
import _ from 'lodash';
import Layout from '../components/layout';

const NewsCards = ({
  data: {
    allArticle: { totalCount, edges: articles }
  }
}) => {
  const [startX, setStartX] = useState(0);
  const [pullDeltaX, setPullDeltaX] = useState(0);
  const [readCounter, setReadCounter] = useState(() => {
    if (typeof window !== 'undefined' && window) {
      window.numOfCards = totalCount;
      const todaysDate = new Date().getDate();
      if (window.localStorage.getItem('publishDate') < todaysDate) {
        window.localStorage.setItem('publishDate', todaysDate);
        window.localStorage.setItem('cardsCounter', 0);
      }

      return window.localStorage.getItem('cardsCounter') || 0;
    }
  });

  const handleReloadCards = () => {
    setReadCounter(prevReadCounter => {
      window.localStorage.setItem('cardsCounter', 0);
      return 0;
    });
  };

  const handleOnCardPrevClick = () => {
    setReadCounter(prevReadCounter => {
      const nextReadCounter = prevReadCounter - 1 < 0 ? 0 : prevReadCounter - 1;
      window.localStorage.setItem('cardsCounter', nextReadCounter);
      return nextReadCounter;
    });
    // if (navigator.share) {
    //   navigator
    //     .share({
    //       title: 'WebShare API Demo',
    //       url: 'https://codepen.io/ayoisaiah/pen/YbNazJ'
    //     })
    //     .then(() => {
    //       console.log('Thanks for sharing!');
    //     })
    //     .catch(console.error);
    // } else {
    //   console.log('eLSE Thanks for sharing!');
    // }
  };

  const handleOnCardNextClick = () => {
    setReadCounter(prevReadCounter => {
      const nextReadCounter = prevReadCounter + 1 < 0 ? 0 : prevReadCounter + 1;
      window.localStorage.setItem('cardsCounter', nextReadCounter);
      return nextReadCounter;
    });
  };

  const handleOnCardMove = e => {
    const x = e.pageX || e.nativeEvent.touches[0].pageX;
    setPullDeltaX(parseInt(x - startX));
    return false;
  };

  const handleOnCardMoveStart = e => {
    setStartX(e.pageX || e.nativeEvent.touches[0].pageX);
    // $(document).on('mousemove touchmove', function(e) {
    //   const x = e.pageX || e.originalEvent.touches[0].pageX;
    //   setPullDeltaX(x - startX);
    //   if (!pullDeltaX) return false;
    // });

    // $(document).on('mouseup touchend', function() {
    //   $(document).off('mousemove touchmove mouseup touchend');
    //   if (!pullDeltaX) return false; // prevents from rapid click events
    //   setReadCounter(prevReadCounter => {
    //     const nextReadCounter = parseInt(prevReadCounter) + 1;
    //     window.localStorage.setItem('cardsCounter', nextReadCounter);
    //     return nextReadCounter;
    //   });
    //   setPullDeltaX(0);
    // });
  };

  const handleOnCardMoveEnd = e => {
    if (!pullDeltaX) return false;
    setReadCounter(prevReadCounter => {
      const nextReadCounter = parseInt(prevReadCounter) + 1;
      window.localStorage.setItem('cardsCounter', nextReadCounter);
      return nextReadCounter;
    });
    setPullDeltaX(0);
    setStartX(0);
  };

  return (
    <Layout>
      <header>
        <div className="row">
          <div className="icon">
            {/* <div className="share" onClick={handleOnCardNextClick} /> */}
            <div className="backward" onClick={handleOnCardPrevClick} />
          </div>
          <div className="icon">
            {/* <div className="share" onClick={handleOnCardNextClick} /> */}
            <div className="forward" onClick={handleOnCardNextClick} />
          </div>
          <div className="icon bulb-light">
            <div className="bulb" />
          </div>
        </div>
      </header>
      <section className="demo">
        <main className="demo__content">
          <div className="demo__card-cont">
            {articles.length > readCounter ? (
              _.map(articles, article => (
                <div
                  onTouchStart={handleOnCardMoveStart}
                  onMouseDown={handleOnCardMoveStart}
                  onMouseMove={handleOnCardMove}
                  onTouchMove={handleOnCardMove}
                  onTouchEnd={handleOnCardMoveEnd}
                  onMouseUp={handleOnCardMoveEnd}
                  key={article.node.id}
                  id={`div-${article.node.id}`}
                  className={`demo__card ${
                    article.node.id >= articles.length - readCounter
                      ? 'below'
                      : ''
                  }`}
                >
                  <div>
                    <div className="demo__card__img">
                      <img
                        className="image"
                        src={article.node.urlToImage}
                        alt={article.node.title}
                      />
                    </div>
                    <div className="demo__card__news_text">
                      <h5 className="demo__card__name">{article.node.title}</h5>
                      <span className="author">{`${article.node.author ||
                        article.node.source.name} / ${
                        article.node.publishedAt
                      }`}</span>
                      <p className="demo__card__we">
                        {article.node.description}
                      </p>
                      {article.node.url && (
                        <div className="readmore">
                          <a href={article.node.url}>
                            Read More @ {article.node.source.name}
                          </a>
                        </div>
                      )}
                    </div>
                    {/* <div className="demo__card__choice m--reject" />
                    <div className="demo__card__choice m--like" />
                    <div className="demo__card__drag" /> */}
                  </div>
                </div>
              ))
            ) : (
              <div
                id="div-thankyou"
                className="demo__card"
                onTouchStart={handleReloadCards}
                onMouseDown={handleReloadCards}
              >
                <div className="demo__card__news_text">
                  <h5 className="demo__card__name">
                    Thank you so much for reading all the news
                  </h5>
                  <p className="demo__card__we">You are reading to much...</p>
                  <br />
                  <p className="demo__card__we">Reloading cards for you...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </section>
    </Layout>
  );
};

export default NewsCards;

export const pageQuery = graphql`
  query {
    allArticle {
      totalCount
      edges {
        node {
          source {
            name
            id
          }
          author
          id
          title
          description
          url
          urlToImage
          publishedAt(formatString: "DD, MMM YYYY")
        }
      }
    }
  }
`;
