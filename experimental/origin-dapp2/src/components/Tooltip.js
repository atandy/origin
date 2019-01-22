import React from 'react'
import TooltipTrigger from 'react-popper-tooltip'

const Tooltip = ({ tooltip, children, hideArrow, ...props }) => (
  <TooltipTrigger
    {...props}
    tooltip={({
      getTooltipProps,
      getArrowProps,
      tooltipRef,
      arrowRef,
      placement
    }) => {
      const props = getTooltipProps({
        ref: tooltipRef,
        className: `tooltip bs-tooltip-${placement} fade show`
      })
      const arrowProps = getArrowProps({
        ref: arrowRef,
        'data-placement': placement,
        className: 'arrow'
      })
      return (
        <div {...props}>
          {hideArrow ? null : <div {...arrowProps} />}
          <div className="tooltip-inner">{tooltip}</div>
        </div>
      )
    }}
  >
    {({ getTriggerProps, triggerRef }) =>
      React.cloneElement(children, getTriggerProps({ ref: triggerRef }))
    }
  </TooltipTrigger>
)

export default Tooltip
