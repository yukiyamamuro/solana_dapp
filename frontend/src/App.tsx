import { FC, useEffect, useState } from 'react';
import { Box, Button, Card, Container, CssBaseline, Grid, Input, Typography } from '@mui/material';
import { Commitment ,Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program, web3 } from '@project-serum/anchor';

import { Solana } from './types/Solana';
import idl from './idl.json';

declare global {
  interface Window {
    solana: Solana;
  }
}


const { SystemProgram, Keypair } = web3;
let baseAccount = Keypair.generate();
const com: Commitment = 'processed'
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: com,
}

const TEST_GIFS = [
  'https://media.giphy.com/media/GUowIfzDhLTV4Jbik1/giphy.gif',
  'https://media.giphy.com/media/2yLNN4wTy7Zr8JSXHB/giphy-downsized-large.gif',
  'https://media.giphy.com/media/vDH8edPAviRPp3UHOp/giphy.gif'
]

export const App: FC = () => {
  const [walletAddress, setWalletAddress] = useState<string| null>(null);
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

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();

    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }
  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!")
      return
    }
    setInputValue('');
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  useEffect(() => {
    const onLoading = async () => {
      await checkWalletConnected();
    };
    window.addEventListener('load', onLoading);
    return () => window.removeEventListener('load', onLoading);
  }, []);

  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account)
      setGifList(account.gifList)
    } catch (error) {
      console.log("Error in getGifList: ", error)
      setGifList(null);
    }
  }

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      getGifList()
    }
  }, [walletAddress]);

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
          !walletAddress ?
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
        {walletAddress && (
          gifList === null ? (
              <div className="connected-container">
                <button className="cta-button submit-gif-button" onClick={createGifAccount}>
                  Do One-Time Initialization For GIF Program Account
                </button>
              </div>
            )
          : (
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
              {gifList.map((item, index) => (
                  <Grid key={index} sx={{ padding: 1 }} >
                    <img src={item.gifLink} alt="gif"  height={250} width={250} />
                  </Grid>
              ))}
            </>)
            )
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
