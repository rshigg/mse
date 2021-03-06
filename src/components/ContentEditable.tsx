import React, { useState, ElementType, ChangeEvent, CSSProperties } from 'react';
import cx from 'classnames';

import { contentEditable } from 'styles/card.css';

const activationCostRegex =
  /\n((?<mana>(\d|w|u|b|r|g|x|y)+),)?(\s?(?<word>[\w\s]+),)?(\s?(?<tap>t))?:/gim;

type CEProps = {
  value: string;
  // onChange: (event: ChangeEvent<HTMLDivElement>) => void;
  label: string;
  className?: string;
  tag?: ElementType;
  convertSymbols?: boolean;
  style?: CSSProperties;
};

const ContentEditable = ({
  value,
  className,
  label,
  tag: Tag = 'div',
  convertSymbols = true,
  style = {},
}: CEProps) => {
  const [content] = useState(
    () => value?.split(/\r?\n+/).map((text, i) => <p key={i}>{text}</p>) ?? null
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.currentTarget.innerText;
    console.log('value', value);

    if (convertSymbols) {
      const matches = value.matchAll(activationCostRegex);
      for (const match of matches) {
        console.log(match);
      }
    }
  };

  return (
    <Tag
      contentEditable
      role="textbox"
      aria-label={label}
      onInput={handleChange}
      className={cx(contentEditable, className)}
      style={style}
      suppressContentEditableWarning={true}
    >
      {content}
    </Tag>
  );
};

export default ContentEditable;
