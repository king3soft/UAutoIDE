import React, {useEffect, useRef, useState} from 'react'
import MuiAlert from '@material-ui/lab/Alert';
import {
    AppBar,
    Button,
    Input,
    InputAdornment, Snackbar, TextField,
    Toolbar
} from "@material-ui/core";
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import './MainPage.css'
import ActionCard from "./ActionCard";
import PropTable from "./PropTable";
import EditorCard from "./EditorCard";
import ConsoleCard from "./ConsoleCard";
import ScreenCard from "./ScreenCard";
import {useInterval} from "../Util/Util"

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#11698e',
        },
        secondary: {
            main: '#f44336',
        },
        type: 'dark',
    },
});

const useStyle = makeStyles((style)=>({
    Input:{
        color:'#f44336 !important'
    },
    AppBarON:{
        'background-color':'green'
    },
    AppBarOFF:{
        'background-color':'#11698e'
    },

    Button:{
        'border-radius': 0
    }
}))

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}


export default function MainPage(){
    const classes = useStyle()
    const [okOpen, setOkOpen] = React.useState(false);
    const [isConnected, setIsConnected] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [sn, setSN] = useState("");
    const [ip, setIP] = useState("");
    const [consoleData,setConsoleData] = useState([])//console的输出信息

    //获取console的输出信息
    const getNewLog =  function(){
        window.pywebview.api.PythonOutput().then((res)=>{
            if(res !== "405null") {
                let l = consoleData
                l.push(res)
                setConsoleData([...l])
            }
        })
    }

    useInterval(()=>{
        getNewLog()
    },500)

    const changeSNValue = (e) =>{
        setSN(e.target.value);
    }
    const changeIPValue = (e) =>{
        setIP(e.target.value);
    }
    //底部消息弹窗关闭事件
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOkOpen(false);
    };
    //底部消息弹窗
    let showMsg = (msg)=>{
        setMessage(msg)
        setOkOpen(true)
    }
    //连接设备
    const connect = function (){
        window.pywebview.api.connect({'sn':sn,'ip':ip}).then((res)=>{
            // setIsConnected(res['ok'])
            showMsg(res['msg'])
        })
    }
    //断开连接
    const disConnect = function (){
        window.pywebview.api.disConnect().then((res)=>{
            // setIsConnected(false)
            showMsg(res['msg'])
        })
    }
    const test = function (){
        window.pywebview.api.test().then((res)=>{
            showMsg(res['msg'])
        })
    }
    //检测连接状态
    const checkConnection = function (){
        window.pywebview.api.checkConnection().then((res)=>{
            let status = res['msg']
            setIsConnected(status['isConnected'])
        })
    }

    useInterval(()=>{
        checkConnection()
    },1000)

    useEffect(()=>{
        setTimeout(()=>{
            getCurDevice()
        },2000)
    },[])

    const getCurDevice = () =>{
        window.pywebview.api.getCurDevice().then((res)=>{
            setSN(res['msg'])
        })
    }
        return (
            // <div className={classes.root}>
            <ThemeProvider theme={theme}>
                <div className={'container'}>
                    <AppBar position={"static"} className={isConnected?classes.AppBarON:classes.AppBarOFF}>
                        <Toolbar>
                            <TextField
                                id="filled-helperText"
                                label="设备号"
                                variant="filled"
                                className={classes.Input}
                                value={sn}
                                onChange={changeSNValue}
                            />
                            <TextField
                                id="filled-helperText"
                                label="IP地址"
                                variant="filled"
                                className={classes.Input}
                                value={ip}
                                onChange={changeIPValue}
                            />
                            <Button variant="contained" color="primary" size="medium" disableElevation className={classes.Button} onClick={connect} disabled={isConnected}>连接</Button>
                            <Button variant="contained" color="primary" size="medium" disableElevation className={classes.Button} onClick={disConnect} disabled={!isConnected}>断开</Button>
                            <Button variant="contained" color="primary" size="medium" disableElevation className={classes.Button} onClick={test}>test</Button>
                        </Toolbar>
                    </AppBar>
                    <div id={'content'}>
                        <div className={'left'}>
                            <ActionCard/>
                            <PropTable/>
                        </div>
                        <div className={'middle'}>
                            <EditorCard ShowMsg={showMsg} isConnected={isConnected}/>
                            <ConsoleCard consoleData={consoleData}/>
                        </div>
                        <div className={'right'}>
                            <ScreenCard/>
                        </div>
                    </div>
                </div>
                <Snackbar open={okOpen} autoHideDuration={6000} onClose={handleClose}>
                    <Alert severity="success" onClose={handleClose}>
                        {message}
                    </Alert>
                </Snackbar>
            </ThemeProvider>
            // </div>
        )
}