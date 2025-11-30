import { getBestAuthSupabaseClient } from '../src/lib/bestauth/db-client';
import { getKieApiService } from '../src/lib/kie-api';

const taskId = '55e6ac80b6e6778a9af972d4a3e784e9';

async function checkTaskStatus() {
  console.log(`\n🔍 Checking task status for: ${taskId}\n`);

  const client = getBestAuthSupabaseClient();
  if (!client) {
    console.error('❌ Failed to get database client');
    return;
  }

  // Check if it's a video task (Sora)
  console.log('📹 Checking sora_video_tasks table...');
  const { data: videoTask, error: videoError } = await client
    .from('sora_video_tasks')
    .select('*')
    .eq('task_id', taskId)
    .maybeSingle();

  if (videoError) {
    console.error('❌ Error querying sora_video_tasks:', videoError);
  } else if (videoTask) {
    console.log('✅ Found in sora_video_tasks:');
    console.log(JSON.stringify(videoTask, null, 2));
    
    // Get user info
    const { data: user } = await client
      .from('bestauth_users')
      .select('id, email, name')
      .eq('id', videoTask.user_id)
      .single();
    
    if (user) {
      console.log(`\n👤 User: ${user.email} (${user.name || 'No name'})`);
    }

    // Check credit transactions for this user
    const { data: transactions } = await client
      .from('bestauth_points_transactions')
      .select('*')
      .eq('user_id', videoTask.user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactions && transactions.length > 0) {
      console.log(`\n💰 Recent credit transactions (${transactions.length}):`);
      transactions.forEach((tx: any, idx: number) => {
        console.log(`  ${idx + 1}. ${tx.amount > 0 ? '+' : ''}${tx.amount} credits - ${tx.transaction_type} - ${tx.description || 'N/A'}`);
        if (tx.metadata?.taskId === taskId) {
          console.log(`     ⭐ This transaction is for task ${taskId}`);
        }
      });
    }
    return;
  }

  // Check if it's an image generation task (KIE API)
  console.log('\n🖼️  Checking KIE API for image generation task...');
  try {
    const kieApi = getKieApiService();
    const taskStatus = await kieApi.getTaskStatus(taskId);
    
    console.log('✅ Found in KIE API:');
    console.log(JSON.stringify(taskStatus, null, 2));
    
    // Check credit transactions that might reference this task
    console.log('\n💰 Checking credit transactions...');
    const { data: allTransactions } = await client
      .from('bestauth_points_transactions')
      .select('*')
      .or(`metadata->>taskId.eq.${taskId},description.ilike.%${taskId}%`)
      .order('created_at', { ascending: false });

    if (allTransactions && allTransactions.length > 0) {
      console.log(`Found ${allTransactions.length} related transaction(s):`);
      for (let idx = 0; idx < allTransactions.length; idx++) {
        const tx = allTransactions[idx];
        const user = tx.user_id;
        console.log(`\n  Transaction ${idx + 1}:`);
        console.log(`    User ID: ${user}`);
        console.log(`    Amount: ${tx.amount > 0 ? '+' : ''}${tx.amount} credits`);
        console.log(`    Type: ${tx.transaction_type}`);
        console.log(`    Description: ${tx.description || 'N/A'}`);
        console.log(`    Created: ${tx.created_at}`);
        
        // Get user email
        const { data: userData } = await client
          .from('bestauth_users')
          .select('email, name')
          .eq('id', user)
          .single();
        
        if (userData) {
          console.log(`    User: ${userData.email} (${userData.name || 'No name'})`);
        }
      }
    } else {
      console.log('⚠️  No credit transactions found for this task');
    }

    // Check all transactions with this task ID in metadata
    // Note: Supabase doesn't support direct JSONB contains with nested keys easily
    // We'll check in the filter below instead

  } catch (error: any) {
    console.error('❌ Error querying KIE API:', error.message);
    
    // Still check transactions
    console.log('\n💰 Checking all credit transactions for this task ID...');
    const { data: allTx } = await client
      .from('bestauth_points_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (allTx) {
      const relatedTx = allTx.filter((tx: any) => {
        const meta = tx.metadata || {};
        const desc = tx.description || '';
        return meta.taskId === taskId || desc.includes(taskId);
      });

      if (relatedTx.length > 0) {
        console.log(`Found ${relatedTx.length} related transaction(s):`);
        relatedTx.forEach((tx: any) => {
          console.log(`  - ${tx.amount} credits, ${tx.transaction_type}, ${tx.description}`);
        });
      } else {
        console.log('⚠️  No transactions found matching this task ID');
      }
    }
  }

  // Check points_transactions for any reference to this task
  console.log('\n📊 Checking bestauth_points_transactions for task references...');
  const { data: pointsTx, error: pointsError } = await client
    .from('bestauth_points_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (pointsError) {
    console.error('❌ Error querying transactions:', pointsError);
  } else if (pointsTx) {
    const matchingTx = pointsTx.filter((tx: any) => {
      const meta = tx.metadata || {};
      const desc = tx.description || '';
      return meta.taskId === taskId || 
             meta.task_id === taskId ||
             desc.includes(taskId) ||
             (meta.taskId && String(meta.taskId) === taskId);
    });

    if (matchingTx.length > 0) {
      console.log(`✅ Found ${matchingTx.length} transaction(s) related to this task:`);
      matchingTx.forEach((tx: any, idx: number) => {
        console.log(`\n  Transaction ${idx + 1}:`);
        console.log(`    ID: ${tx.id}`);
        console.log(`    User ID: ${tx.user_id}`);
        console.log(`    Amount: ${tx.amount} credits`);
        console.log(`    Type: ${tx.transaction_type}`);
        console.log(`    Generation Type: ${tx.generation_type || 'N/A'}`);
        console.log(`    Description: ${tx.description || 'N/A'}`);
        console.log(`    Balance After: ${tx.balance_after}`);
        console.log(`    Created: ${tx.created_at}`);
        console.log(`    Metadata:`, JSON.stringify(tx.metadata, null, 2));
      });
    } else {
      console.log('⚠️  No transactions found with this task ID');
    }
  }

  console.log('\n✅ Task status check completed\n');
}

checkTaskStatus().catch(console.error);

