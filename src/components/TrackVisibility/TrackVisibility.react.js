/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React, { useRef, useEffect } from 'react';

export default function TrackVisibility(props) {
  const refContainer = useRef(null);

  useEffect(() => {
    props.observer.observe(refContainer.current);
    return () => {
      props.observer.disconnect();
    };
  }, [props.observer]);

  return <div ref={refContainer}>{props.children}</div>;
}
