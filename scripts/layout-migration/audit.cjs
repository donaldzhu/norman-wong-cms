// Run through `sanity exec ... --with-user-token`; this wrapper only reads.
process.argv=['node','layout-audit','--project','3vmzcbnr','--dataset','production','--fetch','--out',`layout-audit-${Date.now()}.local`]
require('./run.cjs').main().catch(error=>{console.error(error.message);process.exitCode=1})
