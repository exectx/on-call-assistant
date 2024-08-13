import React, { type ReactNode } from "react";

interface ForProps<T> {
  each: T[];
  children: (item: T, index: number) => ReactNode;
}

const For = <T,>({ each, children }: ForProps<T>): ReactNode[] | ReactNode => {
  // return (
  //   <>
  //     {each.map((item, index) => (
  //         children(item, index)
  //     ))}
  //   </>
  // );

  if (!each.length) {
    return null;
  }
  return each.map((item, index) => children(item, index));
};

export default For;
