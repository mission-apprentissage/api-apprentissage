import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Box, Link, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { DataSource } from "shared/docs/types";

function SourceCard(props: DataSource) {
  return (
    <Box
      className={fr.cx("fr-enlarge-link", "fr-tile")}
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "lg",
        pt: fr.spacing("3w"),
        pb: fr.spacing("4w"),
        px: fr.spacing("3w"),
        gap: fr.spacing("1w"),
      }}
    >
      <Box
        sx={{
          flexWrap: "wrap",
          gap: fr.spacing("1w"),
          display: "flex",
          alignItems: "center",
          position: "relative",
          height: "80px",
        }}
      >
        <Image
          width={props.logo.width}
          height={props.logo.height}
          src={props.logo.href}
          alt={`Logo des fournisseurs de ${props.name}`}
        />
      </Box>
      <Box
        sx={{
          flexWrap: "wrap",
          gap: fr.spacing("1w"),
          display: "flex",
        }}
      >
        {props.providers.map((provider) => (
          <Badge
            key={provider}
            small
            style={{
              backgroundColor: fr.colors.decisions.background.contrast.purpleGlycine.default,
              color: fr.colors.decisions.text.actionHigh.purpleGlycine.default,
            }}
          >
            {provider}
          </Badge>
        ))}
      </Box>
      <Box
        display="flex"
        gap={fr.spacing("1w")}
        flexDirection="column"
        sx={{
          pb: fr.spacing("4w"),
        }}
      >
        <Typography
          variant="h6"
          color={fr.colors.decisions.text.default.grey.default}
          className={fr.cx("fr-tile__title")}
          sx={{
            textAlign: "left",
          }}
        >
          <Link
            component={NextLink}
            sx={{
              color: fr.colors.decisions.text.default.grey.default,
              textWrap: "balance",
            }}
            underline="none"
            href={props.href}
            rel={"noopener noreferrer"}
            target={"_blank"}
            className={fr.cx(`fr-text--lg`, "fr-link--lg")}
          >
            {props.name}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

type DataSourcesProps = {
  sources: DataSource[];
};

export function DataSources(props: DataSourcesProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: fr.spacing("4w"),
        marginY: fr.spacing("6w"),
      }}
    >
      <Typography variant="h2" sx={{ color: fr.colors.decisions.artwork.minor.blueEcume.default }}>
        Sources et fournisseurs des données
      </Typography>

      <Box display="grid" gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr 1fr"]} gap={fr.spacing("2w")}>
        {props.sources.map((source) => (
          <SourceCard key={source.name} {...source} />
        ))}
      </Box>
    </Box>
  );
}
