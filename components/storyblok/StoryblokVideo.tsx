import { Box } from '@mui/system';
import dynamic from 'next/dynamic';
import { richtextContentStyle } from '../../styles/common';
// See React Player Hydration issue https://github.com/cookpete/react-player/issues/1474
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

const videoContainerStyle = {
  position: 'relative',
  paddingTop: '56.25%',
} as const;

const videoStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
} as const;

interface StoryblokVideoProps {
  video: { url: string };
  size: string;
  alignment: string;
}

const StoryblokVideo = (props: StoryblokVideoProps) => {
  const { video, size = 'extra-large', alignment = 'left' } = props;

  if (!video) return <></>;

  const containerStyle = {
    maxWidth: 514, // <515px prevents the "Watch on youtube" button
    width:
      size === 'extra-small'
        ? { xs: 80, md: 120 }
        : size === 'small'
        ? { xs: 140, md: 180 }
        : size === 'medium'
        ? { xs: 200, md: 250 }
        : size === 'large'
        ? { xs: 400, md: 480 }
        : '100%',
    marginY:
      size === 'extra-small'
        ? 2
        : size === 'small'
        ? 3
        : size === 'medium'
        ? 4
        : size === 'large'
        ? 5
        : 6,
    marginLeft: alignment === 'center' || alignment === 'right' ? 'auto' : 0,
    marginRight: alignment === 'center' ? 'auto' : 0,

    ...richtextContentStyle,
  } as const;
  const extraConfig =
    video.url.indexOf('youtu.be') > -1 || video.url.indexOf('youtube') > -1
      ? {
          config: {
            youtube: {
              embedOptions: {
                host: 'https://www.youtube-nocookie.com',
              },
            },
          },
        }
      : {};
  return (
    <Box sx={containerStyle}>
      <Box sx={videoContainerStyle}>
        <ReactPlayer
          style={videoStyle}
          width="100%"
          height="100%"
          light={true}
          url={video.url}
          controls
          modestbranding={1}
          {...extraConfig}
        />
      </Box>
    </Box>
  );
};

export default StoryblokVideo;
