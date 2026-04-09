var DEBUG=true

var startTime=0
var tokenDecimals=0
var distributionType='erc20'
var splTokenDecimals=0

function main(){
    if(DEBUG){console.log('test')}
    refreshData()
    window.setInterval('refreshData()',2500)

    //controlLoopFaster()
}
function controlLoopFaster(){
    //put faster update stuff here
    refreshTimers()
    setTimeout(controlLoopFaster,30)
}
function refreshData(){
  console.log('refreshdata called')
  //document.getElementById('buyButton').onclick=buy2;
  document.getElementById('approveButton').onclick=approve2;
  document.getElementById('distribute').onclick=distribute2;
  const distributionTypeInput = document.getElementById('distributionType')
  if(distributionTypeInput){
    distributionType = distributionTypeInput.value || 'erc20'
  }
  toggleDistributionUI(distributionType)

  if(distributionType==='sol' || distributionType==='spl'){
    if(distributionType==='spl'){
      refreshSplTokenData()
    }
    return
  }
  if(!window.web3){
    return
  }

  web3.eth.getAccounts(function (err, accounts) {
    let addr=accounts[0]
    oldEthAddress=addr
    tokenContractAddress=document.getElementById('tokenAddress').value
    if(distributionType==='erc20' && tokenContractAddress){
      window.tokenContract=new web3.eth.Contract(tokenAbi,tokenContractAddress)
      tokenContract.methods.decimals().call().then(function(decimals){
        tokenDecimals=decimals;
        document.getElementById('tokenDecimals').textContent=decimals
        tokenContract.methods.balanceOf(addr).call().then(function(bal){
          document.getElementById('tokenBalance').textContent=parseFloat((bal/(10**decimals)).toFixed(3)).toLocaleString()
        })
        tokenContract.methods.name().call().then(function(name){
          document.getElementById('tokenName').textContent=name;
        })
      })
    }
    //processRecentEvents()
    //updateReflink()
  })
}
function toggleDistributionUI(mode){
  const isNative = mode === 'native'
  const isSolana = mode === 'sol' || mode === 'spl'
  const isSpl = mode === 'spl'
  const idsToToggle = [
    'tokenAddressGroup',
    'tokenNameGroup',
    'tokenBalanceGroup',
    'tokenDecimalsGroup',
    'approveButton'
  ]
  idsToToggle.forEach(function(id){
    const element = document.getElementById(id)
    if(element){
      if(isSolana){
        element.style.display = 'none'
      } else {
        element.style.display = isNative ? 'none' : ''
      }
    }
  })
  const evmControls = ['networkSelect','switchNetworkButton','multisenderAddress']
  evmControls.forEach(function(id){
    const element = document.getElementById(id)
    if(element){
      element.style.display = isSolana ? 'none' : ''
    }
  })
  const solanaNetworkGroup = document.getElementById('solanaNetworkGroup')
  if(solanaNetworkGroup){
    solanaNetworkGroup.style.display = isSolana ? '' : 'none'
  }
  const solanaTokenMintGroup = document.getElementById('solanaTokenMintGroup')
  if(solanaTokenMintGroup){
    solanaTokenMintGroup.style.display = isSpl ? '' : 'none'
  }
  const textarea = document.getElementById('relativeShares')
  const totalAmountLabel = document.getElementById('totalAmountLabel')
  if(textarea){
    if(mode==='native'){
      textarea.placeholder = 'Enter recipient address and native amount per wallet (address,amount).'
    } else if(mode==='sol'){
      textarea.placeholder = 'Enter recipient Solana address and SOL amount per wallet (address,amount).'
    } else if(mode==='spl'){
      textarea.placeholder = 'Enter recipient Solana address and SPL token amount per wallet (address,amount).'
    } else {
      textarea.placeholder = 'Enter recipient address and relative weight per wallet (address,weight).'
    }
  }
  if(totalAmountLabel){
    if(mode==='native'){
      totalAmountLabel.textContent = 'Native amount to distribute:'
    } else if(mode==='sol'){
      totalAmountLabel.textContent = 'SOL amount to distribute:'
    } else if(mode==='spl'){
      totalAmountLabel.textContent = 'SPL tokens to distribute:'
    } else {
      totalAmountLabel.textContent = 'Tokens to distribute:'
    }
  }
}
function addToList(listid,content){
  var list = document.getElementById(listid);
  var entry = document.createElement('li');
  entry.appendChild(document.createTextNode(content));
  list.appendChild(entry);
}
MAX_LIST_ELEMENTS=7
lastevent=null
//web3.eth.getBlock()
function processRecentEvents(){
  web3.eth.getAccounts(function (err, accounts) {
    web3.eth.getBlockNumber().then(function(bnum){
      tokenContract.getPastEvents("Transfer",{ fromBlock: (bnum-20000)+'', toBlock: 'latest' },function(error,events){
        events=events.reverse()
        $("#recentrewards").empty()
        $("#yourrecentrewards").empty()
        var count=0
        var usercount=0
        events.forEach(function(eventResult){
          //web3.eth.getBlock(eventResult.blockNumber).then(function(block){
            lastevent=eventResult
            if (error){
              console.log('Error in myEvent event handler: ' + error);
            }
            else if(count<MAX_LIST_ELEMENTS){
              //console.log('myEvent: ' + JSON.stringify(eventResult.returnValues));
              var timedisplay=""//new Date(1000*block.timestamp)
              addToList('recentrewards',weiToDisplay(eventResult.returnValues._value)+" "+eventResult.returnValues._addr+" "+timedisplay)
              count++
              if(usercount<MAX_LIST_ELEMENTS && eventResult.returnValues._addr==accounts[0]){
                //console.log('found user payout event ')
                addToList('yourrecentrewards',weiToDisplay(eventResult.returnValues._value)+" "+timedisplay)
                usercount++
              }
            }
          //})
        })
      });
    })
  })
}
function refreshTimers(){
  var nowtime=new Date().getTime()/1000
  setTimerFromSeconds(Number(startTime)-nowtime)
  // if(nowtime>startTime){
  // }
  // else{
  //
  // }
}
function disableButton(buttonId){
  //console.log('placeholder, button disabled ',buttonId)
  document.getElementById(buttonId).disabled=true
}
function enableButton(buttonId){
  //console.log('placeholder, button enabled ',buttonId)
  document.getElementById(buttonId).disabled=false
}
function setTimerFromSeconds(seconds){
  //console.log('secondssettimer ',seconds)
  if(seconds<0){
    seconds=86400
  }
  var days        = 0//Math.floor(seconds/24/60/60);
  var hoursLeft   = Math.floor((seconds))// - (days*86400));
  var hours       = Math.floor(hoursLeft/3600);
  var minutesLeft = Math.floor((hoursLeft) - (hours*3600));
  var minutes     = Math.floor(minutesLeft/60);
  var remainingSeconds = seconds % 60;
  setTimer(days,hours,minutes,remainingSeconds)
}
function setTimer(days,hours,minutes,seconds){
  //console.log('settimer ',days,hours,minutes,seconds)
  //document.getElementById('days').textContent=days

  document.getElementById('hours').textContent=hours
  document.getElementById('minutes').textContent=minutes
  document.getElementById('seconds').textContent=seconds.toFixed(2)
}
function weiToDisplay(wei){
    return formatEthValue(web3.utils.fromWei(wei,'ether'))
}
function formatEthValue(ethstr){
    return parseFloat(parseFloat(ethstr).toFixed(2));
}
/*
  ApproveAndCall example
*/
/*
function buy2(){
  if(DEBUG){console.log('buy2')}
  let tospend=document.getElementById('buyamount').value
  if(Number(tospend)>0){
      web3.eth.getAccounts(function (err, accounts) {
        address=accounts[0]
        console.log('buy ',lotteryAddress,web3.utils.toWei(tospend,'ether'),address)
        tokenContract.methods.approveAndCall(lotteryAddress,web3.utils.toWei(tospend,'ether'),'0x0000000000000000000000000000000000000000').send({from:address}).then(function(err,result){
          if(DEBUG){console.log('buy')}
        })
      })
  }
}
*/
function approve2(){
  if(DEBUG){console.log('approve2')}
  if(distributionType==='sol' || distributionType==='spl'){
    alert('Approval is only required for ERC-20 multisender mode.')
    return
  }
  if(!window.web3){
    alert('Please connect an EVM wallet first.')
    return
  }
  if(!setAirdropContractFromInput()){
    return;
  }
  web3.eth.getAccounts(function (err, accounts) {
    address=accounts[0]
    tokenContract.methods.approve(airdropContractAddress,web3.utils.toWei("10000000000",'ether')).send({from:address}).then(function(err,result){
      if(DEBUG){console.log('approve')}
    })
  })
}
function distribute2(){
  if(DEBUG){console.log('distribute2')}
  if(distributionType==='sol'){
    distributeSol()
    return
  }
  if(distributionType==='spl'){
    distributeSpl()
    return
  }
  if(!window.web3){
    alert('Please connect an EVM wallet first.')
    return
  }
  if(distributionType==='erc20' && !setAirdropContractFromInput()){
    return;
  }
  web3.eth.getAccounts(function (err, accounts) {
    var address=accounts[0]
    if(distributionType==='native'){
      distributeNative(address)
      return
    }
    distributeErc20(address)
  })
}
function getSolanaRpcEndpoint(){
  var cluster=document.getElementById('solanaNetworkSelect').value
  if(cluster==='devnet'){
    return 'https://api.devnet.solana.com'
  }
  return 'https://api.mainnet-beta.solana.com'
}
async function getSolanaProvider(){
  if(!window.solana || !window.solana.isPhantom){
    alert('Phantom wallet not detected. Install/open Phantom to use Solana modes.')
    return null
  }
  await window.solana.connect()
  return window.solana
}
function getSolanaConnection(){
  return new solanaWeb3.Connection(getSolanaRpcEndpoint(), 'confirmed')
}
function parseSolanaAddressAmountText(text){
  var lines=text.split('\n')
  var recipients=[]
  var total=0
  for(var i=0;i<lines.length;i++){
    if(!lines[i] || !lines[i].trim()){
      continue
    }
    var count = (lines[i].match(/,/g) || []).length;
    if(count!==1){
      return null
    }
    var parts=lines[i].split(',')
    var address=(parts[0] || '').trim()
    var amountStr=(parts[1] || '').trim()
    var amount=Number(amountStr)
    try {
      new solanaWeb3.PublicKey(address)
    } catch (e){
      return null
    }
    if(!Number.isFinite(amount) || amount<=0){
      return null
    }
    recipients.push({address:address, amount:amount})
    total+=amount
  }
  if(recipients.length===0){
    return null
  }
  return {recipients:recipients,total:total}
}
async function distributeSol(){
  var provider=await getSolanaProvider()
  if(!provider){
    return
  }
  var values=parseSolanaAddressAmountText(document.getElementById('relativeShares').value)
  if(!values){
    alert('Invalid Solana input. Use one "address,amount" pair per line.')
    return
  }
  var totalSol=Number(document.getElementById('tokenstodistribute').value)
  if(!Number.isFinite(totalSol) || totalSol<=0){
    alert('Please enter a SOL amount greater than zero.')
    return
  }
  if(Math.abs(values.total-totalSol)>0.000000001){
    alert('Sum of SOL amounts must match the total amount.')
    return
  }
  const fromPubkey=provider.publicKey
  const connection=getSolanaConnection()
  for(var i=0;i<values.recipients.length;i++){
    const lamports=Math.round(values.recipients[i].amount*solanaWeb3.LAMPORTS_PER_SOL)
    const tx=new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: fromPubkey,
        toPubkey: new solanaWeb3.PublicKey(values.recipients[i].address),
        lamports: lamports
      })
    )
    tx.feePayer = fromPubkey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    const signed=await provider.signTransaction(tx)
    await connection.sendRawTransaction(signed.serialize())
  }
  alert('SOL distribution submitted successfully.')
}
function bigIntToU64LE(value){
  var buffer=new Uint8Array(8)
  var current=value
  for(var i=0;i<8;i++){
    buffer[i]=Number(current & 255n)
    current = current >> 8n
  }
  return buffer
}
function getAssociatedTokenAddress(ownerPubkey, mintPubkey){
  const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  const ASSOCIATED_TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  return solanaWeb3.PublicKey.findProgramAddressSync(
    [ownerPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0]
}
async function createAtaInstructionIfNeeded(connection, payerPubkey, ownerPubkey, mintPubkey){
  const ASSOCIATED_TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  const SYSTEM_PROGRAM_ID = new solanaWeb3.PublicKey('11111111111111111111111111111111')
  const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  const ata = getAssociatedTokenAddress(ownerPubkey, mintPubkey)
  const accountInfo = await connection.getAccountInfo(ata)
  if(accountInfo){
    return {ata:ata,instruction:null}
  }
  return {
    ata:ata,
    instruction:new solanaWeb3.TransactionInstruction({
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      keys:[
        {pubkey:payerPubkey,isSigner:true,isWritable:true},
        {pubkey:ata,isSigner:false,isWritable:true},
        {pubkey:ownerPubkey,isSigner:false,isWritable:false},
        {pubkey:mintPubkey,isSigner:false,isWritable:false},
        {pubkey:SYSTEM_PROGRAM_ID,isSigner:false,isWritable:false},
        {pubkey:TOKEN_PROGRAM_ID,isSigner:false,isWritable:false},
        {pubkey:solanaWeb3.SYSVAR_RENT_PUBKEY,isSigner:false,isWritable:false}
      ],
      data:new Uint8Array([])
    })
  }
}
async function fetchSplTokenDecimals(){
  var mintAddress=(document.getElementById('solanaTokenMint').value || '').trim()
  if(!mintAddress){
    return null
  }
  var connection=getSolanaConnection()
  var mintPubkey
  try{
    mintPubkey=new solanaWeb3.PublicKey(mintAddress)
  } catch (e){
    return null
  }
  var mintInfo=await connection.getParsedAccountInfo(mintPubkey)
  if(!mintInfo || !mintInfo.value || !mintInfo.value.data || !mintInfo.value.data.parsed){
    return null
  }
  return mintInfo.value.data.parsed.info.decimals
}
async function refreshSplTokenData(){
  const decimals=await fetchSplTokenDecimals()
  if(decimals===null || typeof decimals==='undefined'){
    return
  }
  splTokenDecimals=Number(decimals)
}
async function distributeSpl(){
  var provider=await getSolanaProvider()
  if(!provider){
    return
  }
  var mintAddress=(document.getElementById('solanaTokenMint').value || '').trim()
  if(!mintAddress){
    alert('Please enter the SPL token mint address.')
    return
  }
  var mintPubkey
  try{
    mintPubkey=new solanaWeb3.PublicKey(mintAddress)
  } catch (e){
    alert('Invalid SPL token mint address.')
    return
  }
  const decimals=await fetchSplTokenDecimals()
  if(decimals===null || typeof decimals==='undefined'){
    alert('Unable to fetch mint decimals on the selected Solana cluster.')
    return
  }
  splTokenDecimals=Number(decimals)
  var values=parseSolanaAddressAmountText(document.getElementById('relativeShares').value)
  if(!values){
    alert('Invalid Solana input. Use one "address,amount" pair per line.')
    return
  }
  var totalTokens=Number(document.getElementById('tokenstodistribute').value)
  if(!Number.isFinite(totalTokens) || totalTokens<=0){
    alert('Please enter a token amount greater than zero.')
    return
  }
  if(Math.abs(values.total-totalTokens)>0.000000001){
    alert('Sum of SPL token amounts must match the total amount.')
    return
  }
  const connection=getSolanaConnection()
  const owner=provider.publicKey
  const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  const senderAta = getAssociatedTokenAddress(owner, mintPubkey)
  for(var i=0;i<values.recipients.length;i++){
    const recipientPubkey = new solanaWeb3.PublicKey(values.recipients[i].address)
    const amountBaseUnits = BigInt(Math.round(values.recipients[i].amount*Math.pow(10,splTokenDecimals)))
    const ataData = await createAtaInstructionIfNeeded(connection, owner, recipientPubkey, mintPubkey)
    const recipientAta = ataData.ata
    const transferInstruction = new solanaWeb3.TransactionInstruction({
      programId: TOKEN_PROGRAM_ID,
      keys: [
        {pubkey:senderAta,isSigner:false,isWritable:true},
        {pubkey:recipientAta,isSigner:false,isWritable:true},
        {pubkey:owner,isSigner:true,isWritable:false}
      ],
      data: new Uint8Array([3].concat(Array.from(bigIntToU64LE(amountBaseUnits))))
    })
    const tx = new solanaWeb3.Transaction()
    if(ataData.instruction){
      tx.add(ataData.instruction)
    }
    tx.add(transferInstruction)
    tx.feePayer=owner
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    const signed=await provider.signTransaction(tx)
    await connection.sendRawTransaction(signed.serialize())
  }
  alert('SPL token distribution submitted successfully.')
}
function distributeErc20(address){
  //airdrop(address[] memory toAirdrop,uint[] memory ethFromEach,uint totalEth,uint tokensRewarded,address tokenAddress) public{
  var tokensToDistribute=document.getElementById('tokenstodistribute').value
  if(!tokenDecimals){
    alert('please wait for token to load')
    return;
  }
  if(Number(tokensToDistribute)<=0){
    alert('please enter a token amount greater than zero')
    return;
  }
  const decimalsFactor = web3.utils.toBN(10).pow(web3.utils.toBN(tokenDecimals))
  tokensToDistribute=web3.utils.toBN(tokensToDistribute).mul(decimalsFactor)
  var text=document.getElementById('relativeShares').value
  var values=processTextValues(text, true)
  if(!values){
    alert('check your text formatting, one comma per line etc')
    return null;
  }
  if(values.addresses.length!=values.amounts.length){
    alert('mismatch in address/amount counts')
    return null;
  }
  console.log('distributing with parameters ',values,tokensToDistribute.toString(),tokenContractAddress)
  airdropContract.methods.airdrop(values.addresses,values.amounts,values.total.toString(),tokensToDistribute.toString(),tokenContractAddress).send({from:address}).then(function(err,result){
    if(DEBUG){console.log('approve')}
  })
}
async function distributeNative(address){
  var totalNative=document.getElementById('tokenstodistribute').value
  if(Number(totalNative)<=0){
    alert('please enter a native coin amount greater than zero')
    return;
  }
  var text=document.getElementById('relativeShares').value
  var values=processTextValues(text, false)
  if(!values){
    alert('check your text formatting, one comma per line etc')
    return null;
  }
  if(values.addresses.length!=values.amounts.length){
    alert('mismatch in address/amount counts')
    return null;
  }
  const enteredTotalWei = web3.utils.toBN(web3.utils.toWei(totalNative+'','ether'))
  if(!values.total.eq(enteredTotalWei)){
    alert('sum of native amounts does not equal total amount to distribute')
    return;
  }
  for(var i=0;i<values.addresses.length;i++){
    await web3.eth.sendTransaction({
      from: address,
      to: values.addresses[i],
      value: values.amounts[i]
    })
  }
}
function processTextValues(text, parseAsWeights){
  var lines=text.split('\n')
  var addresses=[]
  var amounts=[]
  var total=web3.utils.toBN(0)
  for(var i=0;i<lines.length;i++){
    if(!lines[i] || !lines[i].trim()){
      continue;
    }
    var count = (lines[i].match(/,/g) || []).length;
    if(count!=1){
      return null;
    }
    var parts=lines[i].split(',')
    var recipient=(parts[0] || '').trim()
    var value=(parts[1] || '').trim()
    if(!web3.utils.isAddress(recipient) || Number(value)<=0){
      return null;
    }
    addresses.push(recipient)
    var weivalue=web3.utils.toWei(value+'','ether')
    amounts.push(weivalue)
    total=total.add(web3.utils.toBN(weivalue))
  }
  if(parseAsWeights && total.isZero()){
    return null;
  }
  if(addresses.length===0){
    return null;
  }
  return {total:total,addresses:addresses,amounts:amounts}
}
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}
function copyRef() {
  console.log('copied reflink to clipboard')
  copyToClipboard(document.getElementById('myreflink'))
  alert('copied to clipboard '+document.getElementById('myreflink').textContent)
  //alert("Copied the text: " + copyText.value);
}
function updateReflink(){
  web3.eth.getAccounts(function (err, accounts) {
    var prldoc=document.getElementById('myreflink')
    prldoc.textContent=window.location.origin.replace('http://','https://')+"?ref="+accounts[0]
  })
}
function getRefToUse(){
  var reftouse=0;
  var urlref=getQueryVariable('ref')
  if(!urlref){
    urlref='0x0000000000000000000000000000000000000000'
  }
  reftouse=escape(urlref)
  if(reftouse.length!=42){
    reftouse='0x0000000000000000000000000000000000000000'
  }
  return reftouse
}
function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}
