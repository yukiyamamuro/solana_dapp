import { Box, Button, Card, Container, CssBaseline, Grid, Input, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { Solana } from './types/Solana';

declare global {
  interface Window {
    solana: Solana;
  }
}

const TEST_GIFS = [
  'https://media.giphy.com/media/GUowIfzDhLTV4Jbik1/giphy.gif',
  'https://media.giphy.com/media/2yLNN4wTy7Zr8JSXHB/giphy-downsized-large.gif',
  'https://media.giphy.com/media/vDH8edPAviRPp3UHOp/giphy.gif'
]

export const App: FC = () => {
  const [walletAddres, setWalletAddress] = useState<string| null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [gifList, setGifList] = useState<string[]>([]);

  const checkWalletConnected = async () => {
    try {
      const { solana } = window;

      if (solana && solana.isPhantom) {
        console.log('Phantom is connected');

        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(
          'Connected with Public Key: ',
          response.publicKey.toString()
        );

        setWalletAddress(response.publicKey.toString());
      } else {
        alert('Solana object is not Fount. Get a Phantom Wallet.');
      }
    } catch(err) {
        console.log(err);
      }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key: ", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target;
    setInputValue(value);
  };

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue);
      setGifList([...gifList, inputValue]);
      setInputValue('');
    } else {
      console.log('Empty input. Try again.');
    }
  };

  useEffect(() => {
    const onLoading = async () => {
      await checkWalletConnected();
    };
    window.addEventListener('load', onLoading);
    return () => window.removeEventListener('load', onLoading);
  }, []);

  useEffect(() => {
    if (walletAddres) {
      console.log('Fetching gifs...');

      setGifList(TEST_GIFS);
    }
  }, [walletAddres]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Typography variant="h2" component="h1" gutterBottom>
          🖼 GIF Portal
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          View your GIF collection
        </Typography>
        <Typography variant="body1" paddingY={5}>connect your phantom wallet!!</Typography>
        {
          !walletAddres ?
          (<Button
            onClick={connectWallet}
            variant="contained"
            size='large'
            fullWidth
            sx={{
              background: '-webkit-linear-gradient(left, #60c657 20%, #35aee2 90%)'
            }}
          >
            Connect Wallet
          </Button>) : null
        }
        <main className='main'>
        {walletAddres && (
          <>
            <Card sx={{ padding: 4 }}>
              <form onSubmit={(e) => {e.preventDefault(); sendGif();}}>
                <Typography>Enter GIF link you want to add</Typography>
                <Input
                  type='text'
                  placeholder='Gif link!'
                  sx={{ marginY: 3 }}
                  fullWidth
                  value={inputValue}
                  onChange={onInputChange}
                />
                <Button type='submit' variant="contained" size='large' fullWidth>Submit</Button>
              </form>
            </Card>
            {gifList.map(gif => (
                <Grid key={gif} sx={{ padding: 1 }} >
                  <img src={gif} alt="gif"  height={250} width={250} />
                </Grid>
            ))}
          </>)
          }
        </main>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body1">
            footer
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
