import LoadingButton from '@mui/lab/LoadingButton';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RootState } from '../../app/store';
import rollbar from '../../config/rollbar';
import { DEFAULT_SCALE_START } from '../../constants/common';
import {
  ABOUT_YOU_SETA_ERROR,
  ABOUT_YOU_SETA_REQUEST,
  ABOUT_YOU_SETA_SUCCESS,
  SIGNUP_SURVEY_COMPLETED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle, scaleTitleStyle, staticFieldLabelStyle } from '../../styles/common';
import { hashString } from '../../utils/hashString';
import { ScaleFieldItem } from '../../utils/interfaces';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const actionsStyle = {
  ...rowStyle,
  justifyContent: 'flex-end',
  marginTop: 2,
};

const AboutYouSetAForm = () => {
  const t = useTranslations('Account.aboutYou.setAForm');
  const tBase = useTranslations('Account.aboutYou.baseForm');

  const router = useRouter();

  const [eventUserData, setEventUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hopesInput, setHopesInput] = useState<string>('');
  const [scale1Input, setScale1Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale2Input, setScale2Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale3Input, setScale3Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale4Input, setScale4Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale5Input, setScale5Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale6Input, setScale6Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale7Input, setScale7Input] = useState<number>(DEFAULT_SCALE_START);
  const [scale8Input, setScale8Input] = useState<number>(DEFAULT_SCALE_START);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);

  const scaleQuestions: ScaleFieldItem[] = [
    { name: 'Q1', inputState: scale1Input, inputStateSetter: setScale1Input },
    { name: 'Q2', inputState: scale2Input, inputStateSetter: setScale2Input },
    { name: 'Q3', inputState: scale3Input, inputStateSetter: setScale3Input },
    { name: 'Q4', inputState: scale4Input, inputStateSetter: setScale4Input },
    { name: 'Q5', inputState: scale5Input, inputStateSetter: setScale5Input },
    { name: 'Q6', inputState: scale6Input, inputStateSetter: setScale6Input },
    { name: 'Q7', inputState: scale7Input, inputStateSetter: setScale7Input },
    { name: 'Q8', inputState: scale8Input, inputStateSetter: setScale8Input },
  ];

  useEffect(() => {
    setEventUserData(getEventUserData({ user, partnerAccesses, partnerAdmin }));
  }, [user, partnerAccesses, partnerAdmin]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(ABOUT_YOU_SETA_REQUEST, eventUserData);

    const formData = {
      date: new Date().toISOString(),
      user_id: user.id && hashString(user.id),
      hopes: hopesInput,
      ...eventUserData, // add user data
    };

    scaleQuestions.forEach((question) => {
      formData[question.name.toLowerCase()] = question.inputState;
    });

    // post to zapier webhook with the form + user data
    // the zap accepts the data and creates a new row in the google sheet
    // transformRequest required for cors issue see https://stackoverflow.com/a/63776819
    if (process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_SETA_FORM) {
      axios
        .create({ transformRequest: [(data, _headers) => JSON.stringify(data)] })
        .post(process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_SETA_FORM, formData)
        .then(function (response) {
          logEvent(ABOUT_YOU_SETA_SUCCESS, eventUserData);
          logEvent(SIGNUP_SURVEY_COMPLETED, eventUserData);

          router.push('/courses');
          setLoading(false);
        })
        .catch(function (error) {
          rollbar.error('Send zapier webhook about you demo form data error', error);
          logEvent(ABOUT_YOU_SETA_ERROR, {
            ...eventUserData,
            message: error,
          });
          setLoading(false);
          throw error;
        });
    }
  };

  function valuetext(value: number) {
    return `${value}°C`;
  }

  return (
    <Box mt={3}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <TextField
          id="hopes"
          label={t.rich('hopesLabel')}
          onChange={(e) => setHopesInput(e.target.value)}
          value={hopesInput}
          variant="standard"
          fullWidth
          required
          multiline
          rows={3}
          InputLabelProps={{ shrink: true }}
          sx={staticFieldLabelStyle}
        />
        <Typography mb={1}>{tBase('scaleDescriptionLine1')}</Typography>
        <Typography mb="1.5rem !important" fontWeight="600">
          {tBase('scaleDescriptionLine2')}
        </Typography>
        {scaleQuestions.map((question) => (
          <FormControl key={`question-${question.name}`} fullWidth>
            <Typography sx={scaleTitleStyle}>{tBase(`scaleLabels.${question.name}`)}</Typography>
            <Slider
              aria-label={tBase(`scaleLabels.${question.name}`)}
              value={question.inputState}
              onChange={(e, newValue) => question.inputStateSetter(newValue as number)}
              getAriaValueText={valuetext}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={1}
              max={10}
              color="secondary"
            />
          </FormControl>
        ))}

        {formError && (
          <Typography color="error.main" mb={2}>
            {formError}
          </Typography>
        )}
        <Box sx={actionsStyle}>
          <LoadingButton variant="contained" color="secondary" type="submit" loading={loading}>
            {tBase('submitLabel')}
          </LoadingButton>
        </Box>
      </form>
    </Box>
  );
};

export default AboutYouSetAForm;
