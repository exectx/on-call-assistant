import React, { ReactNode } from "react";

interface ShowProps {
  when: unknown;
  fallback?: ReactNode;
  children: ReactNode;
}

const Show: React.FC<ShowProps> = ({ when, fallback = null, children }) => {
  return when ? children : fallback;
};

export default Show;
