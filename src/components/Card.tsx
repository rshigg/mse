import React from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import cx from 'classnames';

import ContentEditable from 'components/ContentEditable';
import { Card } from 'schemas/card';
import { ScryfallCard } from 'schemas/scryfall';
import { cardFromScryfall } from 'utils';

import cardValues from 'data/consider.json';

const testImage = '/consider.png';

const padSetNum = (num: Number) => num.toString().padStart(3, '0');
const cardNumber = padSetNum(44);
const totalCards = padSetNum(277);

const CardForm = ({ set = cardValues.set }) => {
  const { values } = useFormikContext<Card>();
  const { rarity } = values;

  const showStamp = rarity === 'rare' || rarity === 'mythic';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="card-render"
      fillRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      clipRule="evenodd"
      viewBox="0 0 745 1040"
    >
      <defs>
        <pattern id="pattern" x="0" y="0" width="1" height="1" patternUnits="objectBoundingBox">
          <image xlinkHref="/patterns/blue.jpg" x="0" y="0" width="100%" height="100%" />
        </pattern>
        <linearGradient id="outline-gradient" x1="50%" y1="0%" x2="48%" y2="110%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="black" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="grad-common" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="1" />
          <stop offset="50%" stopColor="#000000" stopOpacity="1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="grad-uncommon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#758189" stopOpacity="1" />
          <stop offset="50%" stopColor="#C4DAE6" stopOpacity="1" />
          <stop offset="100%" stopColor="#758189" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="grad-rare" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9E8543" stopOpacity="1" />
          <stop offset="50%" stopColor="#DEC78A" stopOpacity="1" />
          <stop offset="100%" stopColor="#9E8543" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="grad-mythic" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C74237" stopOpacity="1" />
          <stop offset="50%" stopColor="#F8A637" stopOpacity="1" />
          <stop offset="100%" stopColor="#C74237" stopOpacity="1" />
        </linearGradient>
        <linearGradient
          id="foil"
          x1="0"
          x2="1"
          y1="0"
          y2="0"
          gradientTransform="scale(72.356 -72.356) rotate(8.286 3.208 .635)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#6fcbf0" />
          <stop offset=".2" stopColor="#8881b9" />
          <stop offset=".4" stopColor="#ee99ba" />
          <stop offset=".6" stopColor="#f09679" />
          <stop offset=".8" stopColor="#faf29a" />
          <stop offset="1" stopColor="#82c69b" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="100%" height="100%" rx="33" fill="url(#pattern)" />

      <svg
        id="frame"
        fillRule="evenodd"
        strokeLinejoin="round"
        strokeMiterlimit="2"
        clipRule="evenodd"
        viewBox="0 0 745 1040"
      >
        <path
          id="frame-border"
          d="M744.094 31.89c0-17.601-14.289-31.89-31.889-31.89H31.89C14.289 0 0 14.289 0 31.89v976.22c0 17.601 14.289 31.89 31.89 31.89h680.315c17.6 0 31.889-14.289 31.889-31.89V31.89zM49.033 914.633v48.347h647.83v-46.275c12.538-11.04 20.455-27.211 20.455-45.216v-830.7c0-7.822-6.351-14.173-14.173-14.173H44.832c-7.822 0-14.173 6.351-14.173 14.173v830.7c.522 15.911 8.047 31.146 18.374 43.144z"
        />
        <g id="brush" fillRule="nonzero">
          <path
            fill="#fff"
            d="M163.933 996.942c-15.652 12.898-16.335 0-16.335 0s.683-12.898 16.335 0"
          />
          <path
            fill="#fff"
            d="M143.872 991.635c2.257.369 4.911 2.541 4.911 5.308 0 2.759-2.654 4.936-4.911 5.304v-10.612z"
          />
          <path d="M148.532 996.768s.641-4.846 4.094-4.846c3.457.001 10.036 4.864 10.036 4.864s-3.043 1.121-5.63.729c-2.739-.428-5.979-3.195-8.5-.747" />
        </g>
        <text
          id="artist"
          x="166.255"
          y="1003.51"
          fill="#fff"
          fontSize="19.583"
          fontWeight="700"
          className="beleren-smallcaps"
        >
          {values.artist}
        </text>
        <text
          id="set-code"
          x="48.516"
          y="1002.88"
          fill="#fff"
          fontSize="16.667"
          fontWeight="350"
          letterSpacing="1"
          className="gotham"
        >
          {set.toUpperCase()} • EN
        </text>
        <text
          id="copyright"
          x="697.5"
          y="984.136"
          fill="#fff"
          fontSize="16.667"
          textAnchor="end"
          className="mplantin"
        >
          NOT FOR SALE
        </text>
        <text
          id="rarity"
          x="142.502"
          y="984.195"
          fill="#fff"
          fontSize="16.667"
          fontWeight="350"
          className="gotham"
        >
          C
        </text>
        <text
          id="set-number"
          x="49.066"
          y="984.195"
          fill="#fff"
          fontSize="16.667"
          fontWeight="350"
          letterSpacing="1"
          className="gotham"
        >
          {cardNumber}/{totalCards}
        </text>
      </svg>

      <svg id="pipelines" x="38" y="41" width="670" height="922" viewBox="0 0 1344 1849">
        <path
          fill="#0085C3"
          fillRule="evenodd"
          d="M29 0S0 20.22 0 71c0 42.98 22 66 22 66v943s-22 14.22-22 65c0 45.31 21 64 21 64l1 640h1299v-639s22.96-18.74 22-65c-.65-46.43-22-65-22-65V137s22.97-17.14 23-65c.32-52.53-28.02-71.9-28-72H29z"
        />
      </svg>

      <svg
        key={values.card_id}
        id="textbox"
        fillRule="evenodd"
        strokeLinejoin="round"
        strokeMiterlimit="2"
        clipRule="evenodd"
        x="55.5"
        y="649.6"
        width="636"
        height="310"
        viewBox="0 0 636 310"
      >
        <path fill="#dce6ee" d="M0 0h635.43v309.45H0z" />
        <foreignObject x="0" y="0" width="637.1" height="307.97">
          <div className={cx('textbox-container', { 'stamp-visible': showStamp })}>
            <Field as={ContentEditable} name="text" label="Rules text" className="rules-text" />
            {values.flavor_text && (
              <>
                <hr className="ft-separator" />
                <Field
                  as={ContentEditable}
                  name="flavor_text"
                  label="Flavor text"
                  className="flavor-text"
                />
              </>
            )}
          </div>
        </foreignObject>
      </svg>

      <svg
        id="stamp"
        xmlns="http://www.w3.org/2000/svg"
        fillRule="evenodd"
        strokeLinejoin="round"
        strokeMiterlimit="2"
        clipRule="evenodd"
        x="331"
        y="943"
        width="88"
        height="52"
        viewBox="0 0 88 52"
        visibility={showStamp ? 'visible' : 'hidden'}
      >
        <path
          fill="#0085C3"
          fillRule="nonzero"
          d="M0 17.95C1.783 17.95 12.087 0 43.971 0c31.875 0 43.625 17.95 43.625 17.95H0z"
        />
        <path
          fill="black"
          fillRule="nonzero"
          d="M.877 22.467c1.738 0 11.804-17.955 42.921-17.955 31.121 0 42.592 17.955 42.592 17.955H.877z"
        />
        <clipPath id="sticker">
          <path
            d="M11.12 28.014c0 8.963 14.63 16.221 32.68 16.221 18.05 0 32.687-7.258 32.687-16.221 0-8.95-14.637-16.208-32.687-16.208-18.05 0-32.68 7.258-32.68 16.208z"
            clipRule="nonzero"
          />
        </clipPath>
        <g clipPath="url(#sticker)">
          <path
            fill="url(#foil)"
            d="M74.398 4.721L7.835 14.415l5.374 36.904 66.564-9.694-5.375-36.904z"
          />
          <path
            fill="#fff9f2"
            fillRule="nonzero"
            d="M39.86 46.767c-22.883 0-37.537-8.587-37.537-18.746 0-10.154 14.654-18.746 37.537-18.746 22.888 0 38.704 8.592 38.704 18.746 0 10.159-15.816 18.746-38.704 18.746"
          />
        </g>
      </svg>

      <g id="typeline" transform="translate(54.98, 644.6)">
        <path
          id="typeline-bg"
          fill="#c1d7e6"
          d="M0 0H0c-5.4-6.94-11.75-19.25-11.64-30.83.1-11.61 6.03-24.75 11.64-31.4h637.1c5.66 6.51 10.88 19.54 10.88 30.96 0 11.42-5.22 24.75-10.88 31.26z"
        />
        <path
          id="typeline-border"
          fill="none"
          stroke="black"
          strokeWidth="1.5pt"
          d="M0 0H0c-5.4-6.94-11.75-19.25-11.64-30.83.1-11.61 6.03-24.75 11.64-31.4h637.1c5.66 6.51 10.88 19.54 10.88 30.96 0 11.42-5.22 24.75-10.88 31.26z"
        />
        <path
          id="typeline-outline"
          fill="url(#outline-gradient)"
          d="M0 -1H0c-5.62-6.65-10.97-18.21-10.97-29.82 0-11.6 5.35-23.2 10.97-29.86h635.9c5.66 6.52 10.06 18.3 10.06 29.71 0 11.42-4.4 23.46-10.06 29.98zm-2-4.16H2c-4.65-6.2-8.8-15.91-8.8-25.66s4.15-19.48 8.8-25.69h631.9c4.56 6.1 7.9 15.98 7.9 25.54 0 9.58-3.34 19.67-7.9 25.8v.01z"
        />
        <svg x="7" y="-50" width="623" height="52">
          <foreignObject x="0" y="0" width="100%" height="100%">
            <div className="typeline-content">
              <Field
                as={ContentEditable}
                name="type_line"
                label="Typeline"
                convertSymbols={false}
                className="nowrap"
              />
            </div>
          </foreignObject>
        </svg>
      </g>

      <svg
        id="art-box"
        fillRule="evenodd"
        strokeLinejoin="round"
        strokeMiterlimit="2"
        clipRule="evenodd"
        x="53.7"
        y="111"
        width="638"
        height="468"
        viewBox="0 0 638 468"
      >
        <image id="art-bg" xlinkHref="/backgrounds/blue.jpg" width="100%" height="100%" />
        <image id="art" xlinkHref={cardValues.image_uris.art_crop} width="100%" height="100%" />
        <path id="art-border" d="M637.8 0H0v467.72h637.8V0zm-4.17 4.17v459.38H4.17V4.17h629.46z" />
      </svg>

      <g id="title" transform="translate(54.98,108)">
        <path
          id="title-bg"
          fill="#c1d7e6"
          d="M0 0H0c-5.6-6.75-11.6-18.74-11.64-30.97-.05-17.38 11.64-31.04 11.64-31.04l637.1.04c5.65 6.6 10.88 19.42 10.88 31 0 11.57-5.23 24.36-10.88 30.97z"
        />
        <path
          id="title-border"
          fill="none"
          stroke="black"
          strokeWidth="1.5pt"
          d="M0 0H0c-5.6-6.75-11.6-18.74-11.64-30.97-.05-17.38 11.64-31.04 11.64-31.04l637.1.04c5.65 6.6 10.88 19.42 10.88 31 0 11.57-5.23 24.36-10.88 30.97z"
        />
        <path
          id="title-outline"
          fill="url(#outline-gradient)"
          d="M0 -1H0.5c-5.62-6.65-10.97-18.21-10.97-29.82 0-11.6 5.35-23.2 10.97-29.86h635.9c5.66 6.52 10.06 18.3 10.06 29.71 0 11.42-4.4 23.46-10.06 29.98zm-2-4.16H2c-4.65-6.2-8.8-15.91-8.8-25.66s4.15-19.48 8.8-25.69h631.9c4.56 6.1 7.9 15.98 7.9 25.54 0 9.58-3.34 19.67-7.9 25.8v.01z"
        />
        <svg x="8" y="-56" width="628" height="50">
          <foreignObject x="0" y="0" width="100%" height="100%">
            <div className="title-content">
              <Field
                as={ContentEditable}
                name="name"
                label="Card name"
                convertSymbols={false}
                className="title-text nowrap"
              />
            </div>
          </foreignObject>
        </svg>
      </g>

      <image id="test-image" xlinkHref={testImage} width="100%" height="100%" />
    </svg>
  );
};

const initialValues = cardFromScryfall(cardValues as ScryfallCard);

export default function () {
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      <Form>
        <CardForm />
      </Form>
    </Formik>
  );
}
