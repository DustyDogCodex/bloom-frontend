import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/legacy/image';
import { render } from 'storyblok-rich-text-react-renderer';
import { FAQ_OPENED } from '../../constants/events';
import { FaqItem } from '../../constants/faqs';
import illustrationLeafMix from '../../public/illustration_leaf_mix.svg';
import logEvent from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';

const containerStyle = {
  width: '100%',
  maxWidth: 650,
} as const;

const accordionDetail = {
  textAlign: 'left',
} as const;

interface StoryblokFaqsProps {
  faqs: Array<FaqItem>;
  title: string;
}

const StoryblokFaqs = (props: StoryblokFaqsProps) => {
  const { faqs, title } = props;

  const handleChange =
    (faqTitle: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      if (isExpanded) {
        logEvent(FAQ_OPENED, { faqTitle: faqTitle });
      }
    };

  return (
    <Box sx={containerStyle}>
      <Typography variant="h2" mb={2} textAlign="center">
        {title}
      </Typography>
      <Box textAlign="center">
        <Image alt={'alt'} src={illustrationLeafMix} width={125} height={100} />
      </Box>
      {faqs.map((faq, i) => (
        <Accordion key={`panel${i}`} onChange={handleChange(faq.title)}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${i}-content`}
            id={`panel${i}-header`}
          >
            <Typography component="h3" textAlign="left">
              {render(faq.title, RichTextOptions)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={accordionDetail}>
            {render(faq.body, RichTextOptions)}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default StoryblokFaqs;
