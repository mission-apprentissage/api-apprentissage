"use client"

import { fr } from "@codegouvfr/react-dsfr"
import Button from "@codegouvfr/react-dsfr/Button"
import { Box, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material"
import type React from "react"
import type { Dispatch, ReactNode } from "react"
import { useEffect, useId, useRef, useState } from "react"

// Repris du composant PopoverMenu de La bonne alternance. Divergences volontaires :
// - onClick typé (le `(any) => void` d'origine ne passe ni noImplicitAny ni la règle biome noExplicitAny)
// - `disabled` ajouté : le menu remplace des boutons dont un pouvait être désactivé (jeton expiré, sans valeur à copier)
// - ids dérivés de useId() au lieu de constantes : le menu est instancié une fois par ligne de tableau,
//   des ids en dur seraient dupliqués et aria-controls/aria-labelledby pointeraient vers la mauvaise instance
// - `anchorRef.current?.focus()` plutôt qu'une assertion non-nulle, la ref étant nulle si l'élément est démonté
export type PopoverMenuAction = {
  label: string | ReactNode
  onClick?: (event: React.SyntheticEvent) => void
  link?: string
  ariaLabel?: string
  type: "button" | "link" | "externalLink"
  icon?: ReactNode
  disabled?: boolean
} | null

export const PopoverMenu = ({
  actions,
  title,
  resetFlagsOnClose,
}: {
  actions: PopoverMenuAction[]
  title: string
  resetFlagsOnClose?: Dispatch<React.SetStateAction<boolean>>[]
}) => {
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const id = useId()
  const buttonId = `popover-button-${id}`
  const menuId = `popover-menu-${id}`

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
    setAnchorEl(anchorRef.current)
  }

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }
    setOpen(false)
    if (resetFlagsOnClose?.length) {
      resetFlagsOnClose.forEach((reset) => reset(false))
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault()
      setOpen(false)
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  const prevOpen = useRef(open)
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus()
    }

    prevOpen.current = open
  }, [open])

  return (
    <Box>
      <Button
        ref={anchorRef}
        id={buttonId}
        aria-controls={open ? menuId : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        priority="tertiary no outline"
        iconId="fr-icon-settings-5-line"
        style={{
          outlineOffset: 0,
        }}
        title={title}
      />
      <Popper
        sx={{
          zIndex: 1000,
        }}
        open={open}
        anchorEl={anchorEl}
        role={undefined}
        placement="bottom-start"
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === "bottom-start" ? "left top" : "left bottom",
            }}
          >
            <Paper
              sx={{
                width: "100%",
                minWidth: "200px",
                maxWidth: "300px",
                boxShadow: "0 4px 12px 0 rgba(0, 0, 18, 0.16)",
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList sx={{ py: 0, mt: "0 !important" }} autoFocusItem={open} id={menuId} aria-labelledby={buttonId} onKeyDown={handleListKeyDown}>
                  {actions.map((action, idx) => {
                    if (action === null) return null

                    const isLink = action.type === "link" || action.type === "externalLink"

                    const menuItemSx = {
                      px: `${fr.spacing("2v")} !important`,
                      py: `${fr.spacing("3v")} !important`,
                      mx: `0 !important`,
                      mb: `0 !important`,
                      fontSize: "14px !important",
                      minHeight: "24px",
                      color: "#161616 !important",
                      borderLeft: "4px solid transparent",
                      display: "flex",
                      gap: fr.spacing("1w"),
                      textDecoration: "none",
                      backgroundImage: "unset",
                      ":hover": {
                        backgroundColor: `${fr.colors.decisions.background.contrast.info.default} !important`,
                        borderLeft: "4px solid #6A6AF4",
                      },
                      "&.Mui-focusVisible": {
                        backgroundColor: `${fr.colors.decisions.background.contrast.info.default} !important`,
                        borderLeft: "4px solid #6A6AF4",
                      },
                    }

                    if (isLink) {
                      return (
                        <MenuItem
                          key={idx}
                          component="a"
                          href={action.link}
                          aria-label={action.ariaLabel || (action.label as string)}
                          disabled={action.disabled}
                          onClick={(event) => {
                            action.onClick?.(event)
                            handleClose(event)
                          }}
                          disableGutters
                          sx={menuItemSx}
                          {...(action.type === "externalLink" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          {action.icon && <Box sx={{ display: "flex", color: fr.colors.decisions.text.actionHigh.blueFrance.default }}>{action.icon}</Box>}
                          {action.label}
                        </MenuItem>
                      )
                    }

                    return (
                      <MenuItem
                        key={idx}
                        aria-label={action.ariaLabel || (action.label as string)}
                        disabled={action.disabled}
                        onClick={(event) => {
                          action.onClick?.(event)
                          handleClose(event)
                        }}
                        disableGutters
                        sx={menuItemSx}
                      >
                        {action.icon && <Box sx={{ display: "flex", color: fr.colors.decisions.text.actionHigh.blueFrance.default }}>{action.icon}</Box>}
                        {action.label}
                      </MenuItem>
                    )
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  )
}
